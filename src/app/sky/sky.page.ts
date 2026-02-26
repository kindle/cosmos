import { Component, ElementRef, NgZone, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { AlertController } from '@ionic/angular';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader,Font } from 'three/examples/jsm/loaders/FontLoader';

@Component({
  selector: 'app-sky',
  templateUrl: './sky.page.html',
  styleUrls: ['./sky.page.scss'],
})
export class SkyPage implements OnInit, AfterViewInit {

  @ViewChild('rendererContainerSky', { static: true }) rendererContainer: ElementRef|any;

  scene: THREE.Scene|any;
  camera: THREE.PerspectiveCamera|any;
  celestialGroup: THREE.Group = new THREE.Group(); // Group for stars and celestial objects

  stars:any = [];
  starElements:any=[];
  showLabels = true;
  showConstellationNames = true;
  showConstellationLines = true;
  showInteractionGuide = true; // New control property
  lineVisibilityMode = 'auto'; // 'always' or 'auto'
  brightnessAdjustment = 0; // Range -5 to 5
  language: string = 'en';
  constellations: any[] = [];
  constellationElements: any[] = [];
  constellationLines: any[] = [];
  cardinalElements: any[] = [];
  cameraPositionText: string = '';
  
  // Time Control
  anchorDate: Date = new Date(); 
  timeOffset: number = 0; 
  viewDate: Date = new Date();
  
  // Locations
  locations = [
    { name: 'Beijing (北京)', lat: 39.9, lon: 116.4 },
    { name: 'Shenzhen (深圳)', lat: 22.5, lon: 114.0 },
    { name: 'Sydney (悉尼)', lat: -33.9, lon: 151.2 },
    { name: 'London (伦敦)', lat: 51.5, lon: -0.1 },
    { name: 'Seattle (西雅图)', lat: 47.6, lon: -122.3 }
  ];
  selectedLocationIndex = 0;

  // Scene objects that need updates
  zenith: THREE.Vector3 = new THREE.Vector3(0,1,0); 
  horizonMesh: THREE.Mesh|any;
  zenithDot: THREE.Mesh|any;
  nadirDot: THREE.Mesh|any;
  cardinalMarkers: { mesh: THREE.Mesh, label: string, element?: HTMLElement }[] = [];
  zenithLabelSprites: { sprite: THREE.Sprite, dir: string }[] = [];
  nadirLabelSprites: { sprite: THREE.Sprite, dir: string }[] = [];

  // Interaction variables
  centerThreshold = 0.35; // 25% of screen from center
  lastCameraMoveTime = Date.now();
  isUserInteracting = false;
  activeConstellations = new Set<string>(); // Names of constellations to show
  
  constructor(private ngZone: NgZone, private dataService: DataService, private alertController: AlertController) {
    this.constellations = this.dataService.getConstellations();
    // Initialize viewDate to anchorDate (GMT logic handled in display)
    this.viewDate = new Date(this.anchorDate.getTime());
  }

  onTimeChange(event: any) {
    // Range is -720 to 720 (minutes). 0 is center.
    // 5 min steps.
    this.timeOffset = event.detail.value;
    const offsetMs = this.timeOffset * 60 * 1000;
    this.viewDate = new Date(this.anchorDate.getTime() + offsetMs);
  }

  get formattedTime(): string {
    // Return GMT time string
    return this.viewDate.toUTCString().replace('GMT', '(GMT)');
  }

  ngOnInit() {
    this.loadConfig();
    this.build();
  }

  ngAfterViewInit() {
    // Force update labels after view is fully initialized
    setTimeout(() => {
        if (this.camera && this.rendererContainer) {
            // Trigger a resize to ensure proper dimensions
            const container = this.rendererContainer.nativeElement;
            const width = container.clientWidth || window.innerWidth;
            const height = container.clientHeight || window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            // Force label update
            this.updateLabelPositions();
        }
    }, 500);
  }

  loadConfig() {
    const showLabels = localStorage.getItem('sky_showLabels');
    if (showLabels !== null) this.showLabels = JSON.parse(showLabels);

    const showConstellationNames = localStorage.getItem('sky_showConstellationNames');
    if (showConstellationNames !== null) this.showConstellationNames = JSON.parse(showConstellationNames);
    
    const showConstellationLines = localStorage.getItem('sky_showConstellationLines');
    if (showConstellationLines !== null) this.showConstellationLines = JSON.parse(showConstellationLines);

    const showInteractionGuide = localStorage.getItem('sky_showInteractionGuide');
    if (showInteractionGuide !== null) this.showInteractionGuide = JSON.parse(showInteractionGuide);

    const lineVisibilityMode = localStorage.getItem('sky_lineVisibilityMode');
    if (lineVisibilityMode !== null) {
      this.lineVisibilityMode = lineVisibilityMode;
    } else {
        // Migration from old boolean
        const alwaysShowLines = localStorage.getItem('sky_alwaysShowLines');
        if (alwaysShowLines !== null) {
            this.lineVisibilityMode = JSON.parse(alwaysShowLines) ? 'always' : 'auto';
        }
    }

    const brightnessAdjustment = localStorage.getItem('sky_brightnessAdjustment');
    if (brightnessAdjustment !== null) this.brightnessAdjustment = parseFloat(brightnessAdjustment);

    const language = localStorage.getItem('sky_language');
    if (language !== null) this.language = language;

    const locIndex = localStorage.getItem('sky_selectedLocationIndex');
    if (locIndex !== null) this.selectedLocationIndex = parseInt(locIndex, 10);
  }

  onLocationChange() {
    this.saveConfig();
    this.updateLocation();
  }

  saveConfig() {
    localStorage.setItem('sky_showLabels', JSON.stringify(this.showLabels));
    localStorage.setItem('sky_showConstellationNames', JSON.stringify(this.showConstellationNames));
    localStorage.setItem('sky_showConstellationLines', JSON.stringify(this.showConstellationLines));
    localStorage.setItem('sky_showInteractionGuide', JSON.stringify(this.showInteractionGuide));
    localStorage.setItem('sky_lineVisibilityMode', this.lineVisibilityMode);
    localStorage.setItem('sky_brightnessAdjustment', this.brightnessAdjustment.toString());
    localStorage.setItem('sky_language', this.language);
    localStorage.setItem('sky_selectedLocationIndex', this.selectedLocationIndex.toString());
  }

  build() {
    this.scene = new THREE.Scene();
    this.scene.add(this.celestialGroup);

    // Create a semi-transparent sphere resembling the Earth
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.1 });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    // Earth rotates with the celestial sphere (fixed alignment relative to stars in this simplified model?)
    // Actually, Earth rotates relative to stars. 
    // But in this "star map" static view, the Earth Axis (Z) is aligned with Celestial Z.
    this.celestialGroup.add(earth);

    // Create the equator (a ring) 地球环
    // const equatorGeometry = new THREE.RingGeometry(0.95, 1.05, 64);
    // const equatorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
    // const equator = new THREE.Mesh(equatorGeometry, equatorMaterial);
    // equator.rotation.x = Math.PI / 2; // Rotate to be horizontal
    // this.celestialGroup.add(equator);

    // Horizon Mesh Setup (Geometry reused, position updated in updateLocation)
    //地平线 remove later
    const horizonBandHeightDeg = 0;
    const horizonBandHeightRad = THREE.MathUtils.degToRad(horizonBandHeightDeg);
    const horizonThetaStart = (Math.PI / 2) - horizonBandHeightRad; // Start 10 deg above horizon
    const horizonThetaLength = horizonBandHeightRad; // Length is 10 deg, ending at horizon (PI/2)

    // Increase horizon density to prevent gaps or visual artifacts
    const horizonGeometry = new THREE.SphereGeometry(500, 128, 16, 0, Math.PI * 2, horizonThetaStart, horizonThetaLength);
    const horizonMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000, // Dark
      side: THREE.BackSide, // Visible from inside
      transparent: true,
      opacity: 0.8, // Semi-transparent
    });
    this.horizonMesh = new THREE.Mesh(horizonGeometry, horizonMaterial);
    this.horizonMesh.position.set(0, 0, 0); // Always centered
    
    // Horizon is fixed to the OBSERVER (Scene), aligned with World Up (Y) by default.
    // The geometry phiStart/Length are relative to Y axis effectively if we don't rotate.
    // SphereGeometry(..., phiStart, phiLength). Default is full sphere.
    // Here we define a band.
    // We want the band to be "Horizontal".
    // If we assume Y is Up.
    // The band should be at Equator (Phi=PI/2).
    // The original code used horizonThetaStart, horizonThetaLength.
    // Let's assume standard orientation is correct for Y-up.
    this.scene.add(this.horizonMesh);

    // Create Horizon Line (White circle at equator level of horizonMesh)
    const hPositions = [];
    const hRadius = 500;
    const hSegments = 128; // Smoother circle
    
    for (let i = 0; i <= hSegments; i++) {
        const theta = (i / hSegments) * Math.PI * 2;
        // XZ plane circle (Y-up)
        hPositions.push(
            hRadius * Math.cos(theta),
            0,
            hRadius * Math.sin(theta)
        );
    }
    
    
    const horizonLineGeometry = new THREE.BufferGeometry();
    horizonLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(hPositions), 3));
    const horizonLineMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc });
    const horizonLine = new THREE.Line(horizonLineGeometry, horizonLineMaterial);
    
    // Add to horizonMesh so it moves/rotates with it
    this.horizonMesh.add(horizonLine);

    // Create a red dot at (0, 0, 0)  地心
    const dotGeometry = new THREE.SphereGeometry(0.005, 32, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    this.scene.add(dot);


    // Create a white cross at Zenith (天顶)
    // Zenith is fixed at (0, 2, 0) relative to Observer.
    // Create a 4-pointed star (Compass) at Zenith
    const crossGroup = new THREE.Group();
    // Dimensions
    const starRadius = 0.125; // Doubled from 0.0625
    const starThickness = 0.03; // Doubled from 0.015
    
    // Use Cones for the 4 points
    const coneGeometry = new THREE.ConeGeometry(starThickness, starRadius, 4);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xcccccc, 
        transparent: true, 
        opacity: 0.7 
    });

    // North Point (Points towards -Z)
    const nCone = new THREE.Mesh(coneGeometry, material);
    nCone.rotation.x = -Math.PI / 2; // Point up on Y originally, rotate to point to -Z
    nCone.position.z = -starRadius / 2; // Offset center so tip is at -starRadius
    crossGroup.add(nCone);

    // South Point (Points towards +Z)
    const sCone = new THREE.Mesh(coneGeometry, material);
    sCone.rotation.x = Math.PI / 2;
    sCone.position.z = starRadius / 2;
    crossGroup.add(sCone);

    // East Point (Points towards +X)
    const eCone = new THREE.Mesh(coneGeometry, material);
    eCone.rotation.z = -Math.PI / 2;
    eCone.position.x = starRadius / 2;
    crossGroup.add(eCone);

    // West Point (Points towards -X)
    const wCone = new THREE.Mesh(coneGeometry, material);
    wCone.rotation.z = Math.PI / 2;
    wCone.position.x = -starRadius / 2;
    crossGroup.add(wCone);

    // Create labels N/S/E/W
    const createLabel = (text: string, x: number, z: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, 64, 64);
            context.font = 'Bold 40px Arial';
            context.fillStyle = '#cccccc';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, 32, 32);
        }
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture, 
            depthTest: false, 
            depthWrite: false, 
            transparent: true, 
            opacity: 0.7 
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(x, 0, z);
        sprite.scale.set(0.1, 0.1, 1);
        return sprite;
    };

    // Note: In Three.js, by default +Z is towards camera (if not rotated). 
    // In our orientation logic later: 
    // We align -Z of the object to point directly North.
    // So -Z is North. +Z is South.
    // X axis follows right hand rule. If -Z is Forward (North), Y is Up. 
    // Right is X (East). Left is -X (West).
    
    // Position labels at the tips of the arms (starRadius is half-length)
    // Offset slightly more than starRadius to not overlap
    const labelOffset = starRadius + 0.05;

    this.zenithLabelSprites = [];

    const addZenithLabel = (dir: string, x: number, z: number) => {
        const sprite = createLabel(dir, x, z);
        crossGroup.add(sprite);
        this.zenithLabelSprites.push({ sprite, dir });
    };

    // South (-Z)
    addZenithLabel('S', 0, -labelOffset);
    // North (+Z)
    addZenithLabel('N', 0, labelOffset);
    // West (+X)
    addZenithLabel('W', labelOffset, 0);
    // East (-X)
    addZenithLabel('E', -labelOffset, 0);

    this.updateZenithLabels();

    this.zenithDot = crossGroup;
    this.zenithDot.position.set(0, 2, 0); // Directly Up (Y+)
    this.scene.add(this.zenithDot);

    // Create a 4-pointed star (Compass) at Nadir (天底)
    // Clone the geometry and setup
    const nadirGroup = new THREE.Group();
    // Re-use cone geometry and material but make new meshes
    
    // North Point (Towards -Z relative to group center)
    const nnCone = new THREE.Mesh(coneGeometry, material);
    nnCone.rotation.x = -Math.PI / 2; 
    nnCone.position.z = -starRadius / 2;
    nadirGroup.add(nnCone);

    // South Point (Towards +Z relative to group center)
    const nsCone = new THREE.Mesh(coneGeometry, material);
    nsCone.rotation.x = Math.PI / 2;
    nsCone.position.z = starRadius / 2;
    nadirGroup.add(nsCone);

    // East Point (Towards +X relative to group center)
    const neCone = new THREE.Mesh(coneGeometry, material);
    neCone.rotation.z = -Math.PI / 2;
    neCone.position.x = starRadius / 2;
    nadirGroup.add(neCone);

    // West Point (Towards -X relative to group center)
    const nwCone = new THREE.Mesh(coneGeometry, material);
    nwCone.rotation.z = Math.PI / 2;
    nwCone.position.x = -starRadius / 2;
    nadirGroup.add(nwCone);

    this.nadirLabelSprites = [];
    const addNadirLabel = (dir: string, x: number, z: number) => {
        const sprite = createLabel(dir, x, z);
        nadirGroup.add(sprite);
        this.nadirLabelSprites.push({ sprite, dir });
    };

    // For Nadir (looking down), mapping might differ depending on standard convention.
    // If standard "looking from inside", North is North.
    // Zenith North points towards Celestial North Pole. Nadir North points towards Celestial North Pole?
    // No, local Zenith North usually means "North on Horizon".
    // If we simply replicate the orientation logic (N is -Z in local frame),
    // and align -Z to North, it should work for Nadir as well.
    
    // Labels (same mapping as Zenith for consistency if oriented same way)
    addNadirLabel('S', 0, -labelOffset);
    addNadirLabel('N', 0, labelOffset);
    addNadirLabel('W', labelOffset, 0);
    addNadirLabel('E', -labelOffset, 0);

    this.updateNadirLabels(); // Initial text update

    this.nadirDot = nadirGroup;
    this.nadirDot.position.set(0, -2, 0); // Directly Down (Y-)
    this.scene.add(this.nadirDot);

    // DEBUG: Draw Interaction Area Circle
    // The threshold is 0.35 in NDC space (range -1 to 1) relative to center.
    // We can draw a ring on the camera's HUD or simply a 2D circle on screen using HTML overlay.
    // Or we can create a mesh attached to the camera.
    // Let's use a simple HTML overlay for the interaction circle.
    
    let interactionGuide: HTMLDivElement | null = document.getElementById('interaction-guide') as HTMLDivElement;
    if (!interactionGuide) {
        interactionGuide = document.createElement('div');
        interactionGuide.id = 'interaction-guide';
        interactionGuide.style.position = 'absolute';
        interactionGuide.style.top = '50%';
        interactionGuide.style.left = '50%';
        interactionGuide.style.transform = 'translate(-50%, -50%)';
        interactionGuide.style.borderRadius = '50%';
        interactionGuide.style.border = '2px dashed red';
        interactionGuide.style.pointerEvents = 'none'; // Click through
        interactionGuide.style.zIndex = '9999';
        
        // Calculate size based on window dimensions and threshold
        // NDC 1.0 = Edge of screen (half width/height).
        // Threshold 0.35 means 35% of the half-dimension.
        // Wait, NDC x goes from -1 (left) to 1 (right). Width is 2.
        // Distance 0.35 means radius is 0.35 units.
        // Screen Radius = 0.35 * (WindowDimension / 2)?
        // NDC depends on projection. If aspect ratio != 1, an NDC circle is an ellipse on screen?
        // Let's assume we want to visualize strictly what the code checks:
        // distance = sqrt(x^2 + y^2).
        // So it checks a circle in NDC space.
        // If aspect ratio is involved (width > height usually),
        // NDC X=1 is right edge, Y=1 is top edge.
        // If we draw a circle in HTML (pixels), it will be a perfect circle.
        // BUT `project` takes aspect ratio into account.
        // If I move 0.35 in X in NDC, that puts me at X = 0.35 * Width/2 in pixels.
        // If I move 0.35 in Y in NDC, that puts me at Y = 0.35 * Height/2 in pixels.
        // So the "Area" in pixels is actually an ELLIPSE if width != height.
        // Let's draw an ellipse.
        
        this.rendererContainer.nativeElement.appendChild(interactionGuide);
    }
    
    // Initial visibility state
    if (interactionGuide) {
        interactionGuide.style.display = this.showInteractionGuide ? 'block' : 'none';
    }
    
    // Update guide size on resize
    const updateGuideSize = () => {
         const container = this.rendererContainer.nativeElement;
         const w = container.clientWidth || window.innerWidth;
         const h = container.clientHeight || window.innerHeight;
         
         // NDC radius 0.35
         // Pixel Radius X = 0.35 * (w / 2)
         // Pixel Radius Y = 0.35 * (h / 2)
         // Width = 2 * Radius X = 0.35 * w
         // Height = 2 * Radius Y = 0.35 * h
         
         if(interactionGuide){
            interactionGuide.style.width = `${this.centerThreshold * w}px`;
            interactionGuide.style.height = `${this.centerThreshold * h}px`;
         }
    };
    
    // Initial size update
    updateGuideSize();
    // Hook into existing resize
    window.addEventListener('resize', updateGuideSize);


    // Create a camera   观察点在地表
    // Use container dimensions if available, otherwise fallback to window
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 2000);
    
    // Controls setup
    // Note: Controls target and camera position are updated in updateLocation()
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Handle Window Resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth || window.innerWidth;
        const newHeight = container.clientHeight || window.innerHeight;
        
        this.camera.aspect = newWidth / newHeight;
        this.camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
    
    // Initialize interaction handlers
    this.setupInteraction(renderer);

    const controls = new OrbitControls(this.camera, renderer.domElement);
    controls.enableZoom = true; // Enabled zoom
    controls.minDistance = 0.5;   // Prevent going inside the center
    controls.maxDistance = 500; // Limit how far back we can go
    controls.enablePan = false;
    controls.rotateSpeed = -0.5; // Reverse rotation for "look around" feel
    // Save controls reference if needed in updateLocation? 
    // Actually updateLocation needs access to controls to update them.
    // Let's attach controls to 'this' or pass it.
    (this as any).controls = controls;

    // Initial Location Update
    this.updateLocation();
    
    // Restore Saved Camera Position (overrides initial location if present)
    const savedCamPos = localStorage.getItem('sky_cameraPosition');
    if (savedCamPos) {
        try {
            const pos = JSON.parse(savedCamPos);
            if (pos && typeof pos.x === 'number') {
                this.camera.position.set(pos.x, pos.y, pos.z);
                controls.update(); 
            }
        } catch (e) {
            console.error('Failed to load camera position', e);
        }
    }

    controls.addEventListener('change', this.onCameraChange.bind(this));
    controls.addEventListener('start', () => { 
        this.isUserInteracting = true; 
        this.lastCameraMoveTime = Date.now();
    });
    controls.addEventListener('end', () => { 
        this.isUserInteracting = false; 
        this.lastCameraMoveTime = Date.now();
        // Save Camera Position
        const pos = this.camera.position;
        localStorage.setItem('sky_cameraPosition', JSON.stringify({ x: pos.x, y: pos.y, z: pos.z }));
    });


    const scene = this.scene;
    const camera = this.camera;
    // Closure for animation loop access
    // Remove duplicate animate/resize logic from build(), let setupInteraction handle it or merge.
    // Actually, let's keep it in build() and remove from setupInteraction.
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update controls if damping enabled (even if not explicitly enabled, good practice)
      controls.update();

      renderer.render(scene, camera);
      this.animateLines();
      this.animateStars();
      
      // Check if camera moved significantly enough to warrant label update
      // Comparing position or rotation, or just use a flag set by 'change' event?
      // Since 'change' handles it, maybe we missed something?
      // If 'change' event fires, 'updateLabelPositions' is called.
      // But maybe the render happens BEFORE 'change' or AFTER?
      // To sync perfectly, updating labels inside animate is safest for visuals.
      // To avoid performance hit, we can throttle or only check cardinal markers every frame if needed.
      // But let's rely on 'change' IF it works. If user sees lag, maybe we force update here.
      
      // Update Cardinal Markers to ensure sync with frame
      this.updateCardinalMarkersPositionsOnly(); 
    }
  
    const onWindowResize = () => {
        if(this.camera && this.rendererContainer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            
            updateGuideSize();
        }
    };

    window.addEventListener('resize', onWindowResize);
    this.updateStarBrightness();
    animate();
  }

  setupInteraction(renderer: THREE.WebGLRenderer) {
    // Click interaction logic for Star Popup
    let startX = 0;
    let startY = 0;
    // ... pointer logic ...

    
    renderer.domElement.addEventListener('pointerdown', (event: PointerEvent) => {
        startX = event.clientX;
        startY = event.clientY;
    });

    renderer.domElement.addEventListener('pointerup', async (event: PointerEvent) => {
        const diffX = Math.abs(event.clientX - startX);
        const diffY = Math.abs(event.clientY - startY);
        
        // If movement is minimal, treat as click
        if (diffX < 5 && diffY < 5) {
             const mouse = new THREE.Vector2();
             const rect = renderer.domElement.getBoundingClientRect();
             
             // Normalize mouse coordinates to NDC [-1, 1]
             mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
             mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
             
             const raycaster = new THREE.Raycaster();
             // Adjust threshold for raycaster if points are small
             raycaster.params.Points.threshold = 0.1;
             raycaster.setFromCamera(mouse, this.camera);
             
             // Raycast against stars (which are Meshes)
             const intersects = raycaster.intersectObjects(this.stars);
             
             if (intersects.length > 0) {
                 // Get the first intersected object (closest to camera)
                 const intersectedObject = intersects[0].object;
                 const starData = intersectedObject.userData;
                 
                 const starName = this.language === 'zh' ? (starData['zh'] || starData['en']) : starData['en'];
                 
                 const alert = await this.alertController.create({
                    header: starName,
                    message: `Constellation: ${starData['constellation'] || 'Unknown'}\nMagnitude: ${starData['g'] || 'N/A'}`,
                    buttons: ['OK']
                 });

                 await alert.present();
             }
        }
    });

    //celetial sphere 天球 =太阳系边缘 actual 10w * 1.49亿km
    const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial(
      { 
        color: 0x0000ff, //dark blue
        opacity: 0.0, // Fully transparent (0.0 to 1.0)
        side: THREE.BackSide
      });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);

    // Create stars based on the positions of the Big Dipper stars
    const resizetimes = 10;
    this.constellations.forEach(constellation => {
      // Create constellation name label for the first star
      // const constellation = {stars: [], en: 'Name', zh: 'NameZH'}
      let firstStarPosition: any = null;
      let firstStarMesh: any = null;

      constellation.stars.forEach((starPosition: any, index: number) => {
        const starGeometry = new THREE.SphereGeometry(0.03, 32, 32);//0.03

        // Calculate brightness value using 'g' (Gaia magnitude)
        let gMag = starPosition.g;
        if (gMag === undefined || gMag === null) {
            // Fallback if 'g' is missing, try to infer from 'b' or set default
            // If we have 'b', remember b was ~ 22 - g
            if (starPosition.b !== undefined) {
               gMag = 22 - starPosition.b;
            } else {
               gMag = 6; // Default to faint if nothing known
            }
        }
        
        // Map magnitude to brightness 0..1
        let normalizedBrightness = 1.2 - (gMag * 0.15);
        
        // Clamp between 0.1 (min visibility) and 1.0 (max)
        normalizedBrightness = Math.max(0.1, Math.min(1.0, normalizedBrightness));
        
        const colorValue = normalizedBrightness;
        const color = new THREE.Color(colorValue, colorValue, colorValue);
        // Create MeshBasicMaterial
        const starMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });

        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.name = "star_"+starPosition.en.replace(' ','_');
        star.userData = { ...starPosition, constellation: constellation.en }; // Store starPosition for later use
        star.position.set(starPosition.x*resizetimes, starPosition.y*resizetimes, starPosition.z*resizetimes);
        this.celestialGroup.add(star);
        this.stars.push(star);

        if (index === 0) {
            firstStarPosition = starPosition;
            firstStarMesh = star;
        }

        // Create a div for the name label
        const nameLabel = document.createElement('div');
        nameLabel.textContent = this.language === 'zh' ? starPosition.zh : starPosition.en;
        nameLabel.id = star.name;
        nameLabel.style.position = 'absolute';
        nameLabel.style.color = '#ffffff';
        nameLabel.style.fontSize = '12px';
        nameLabel.style.pointerEvents = 'none';
        nameLabel.style.textShadow = '0 0 2px black';

        // Append the div to the container
        this.rendererContainer.nativeElement.appendChild(nameLabel);
      });
      
      // Constellation Name Label
      if(firstStarMesh){
          const constLabel = document.createElement('div');
            // Start content
            constLabel.textContent = this.language === 'zh' ? (constellation.zh || constellation.name) : (constellation.en || constellation.name);
  
            this.rendererContainer.nativeElement.appendChild(constLabel);
            
            constLabel.style.position = 'absolute';
            constLabel.style.color = '#FFA500'; // Orange color to distinguish
            constLabel.style.fontWeight = 'bold';
            constLabel.style.fontSize = '14px';
  
            this.constellationElements.push({
                mesh: firstStarMesh,
                element: constLabel,
                data: constellation
            });
      }

      // Draw Connection Lines
      if (constellation.lines && constellation.lines.length > 0) {
          const points: any[] = [];
          
          // Map stars for lookup
          const starsMap = new Map();
          constellation.stars.forEach((s: any) => starsMap.set(s.en, s));
          
          constellation.lines.forEach((pair: string[]) => {
              const startStar = starsMap.get(pair[0]);
              const endStar = starsMap.get(pair[1]);
              
              if (startStar && endStar) {
                  points.push(new THREE.Vector3(startStar.x * resizetimes, startStar.y * resizetimes, startStar.z * resizetimes));
                  points.push(new THREE.Vector3(endStar.x * resizetimes, endStar.y * resizetimes, endStar.z * resizetimes));
              }
          });
          
          if (points.length > 0) {
              const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
              const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0xffffff, 
                transparent: true, 
                opacity: 0 // Start invisible
            });
            const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
            
            // Initialize draw range to 0 (hidden)
            lineSegments.geometry.setDrawRange(0, 0);

            this.celestialGroup.add(lineSegments);
            
            this.constellationLines.push({
                mesh: lineSegments,
                data: constellation,
                targetOpacity: 0,
                maxDrawCount: points.length,
                currentDrawCount: 0
            });
          } // Close points.length > 0
      } // Close constellation.lines check
    }); // Close constellations.forEach
  } // Close setupInteraction

  updateLocation() {
    const loc = this.locations[this.selectedLocationIndex];
    if (!loc) return;
    
    console.log('Updating location to:', loc.name);

    // 1. Calculate the User's Local Zenith in Celestial Coordinates (Where stars are defined)
    // Our star data uses Z as Celestial North Pole. 
    // Converting sets of (Lat, Lon) to a vector on the unit sphere (Z-up system):
    const latRad = THREE.MathUtils.degToRad(loc.lat);
    const lonRad = THREE.MathUtils.degToRad(loc.lon);
    
    // In celestial coordinates (Z=North), the Zenith vector is:
    const celestialZenith = new THREE.Vector3(
      Math.cos(latRad) * Math.cos(lonRad),
      Math.cos(latRad) * Math.sin(lonRad),
      Math.sin(latRad)
    ).normalize();

    // 2. Rotate the Celestial Group so that 'celestialZenith' aligns with World Up (0, 1, 0)
    // This makes the "Ground" horizontal in the WebGL world (XZ plane)
    const worldUp = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(celestialZenith, worldUp);
    this.celestialGroup.quaternion.copy(quaternion);

    // 3. Set our internal Zenith reference to World Up (0,1,0)
    this.zenith = worldUp.clone();

    // Update Zenith Dot Position
    if (this.zenithDot) {
        this.zenithDot.position.copy(this.zenith).multiplyScalar(2.0);
        
        // Orient the Zenith Cross to match World North
        // We calculate hNorth below which is World North on XZ plane.
        
        // We can't orient it YET because hNorth is calculated a few lines down.
        // Let's refactor this block order or move orientation after hNorth is found.
    }
    
    // Reset Horizon Orientation (Aligned with World Y)
    // Since World Up is now Zenith, the Horizon Plane is the XZ plane.
    // The Horizon Mesh (likely creating a ring) should be aligned with Y-axis.
    // If geometry is standard (Axis=Y), no rotation needed.
    if (this.horizonMesh) {
        this.horizonMesh.rotation.set(0, 0, 0);
        this.horizonMesh.quaternion.identity();
        // Ensure it is visible
        this.horizonMesh.visible = true;
    }
    
    // 4. Calculate World North Direction for Camera LookAt
    // Celestial North Pole is (0,0,1) in Local Celestial Space.
    // We transform it to World Space using the group's rotation.
    const localNorth = new THREE.Vector3(0, 0, 1);
    const worldNorth = localNorth.clone().applyQuaternion(quaternion);

    // Project World North onto Horizon Plane (XZ plane, Normal=Y)
    // This gives us the "North" direction on the ground.
    const hNorth = new THREE.Vector3(worldNorth.x, 0, worldNorth.z).normalize();
    
    // Handle singularity at Poles (if hNorth length is near 0)
    // If at North Pole, Zenith=(0,0,1). WorldUp=(0,1,0). 
    // celestialZenith=(0,0,1).
    // Rotation Z->Y. (Rotate -90 deg around X).
    // Then LocalNorth(0,0,1) rotates to (0,1,0) (World Y).
    // Projection on XZ is (0,0,0). Undefined.
    // We can pick arbitrary direction as North (e.g. -Z).
    if (hNorth.lengthSq() < 0.001) {
       hNorth.set(0, 0, -1); 
    }
    
    // Now that we have hNorth (World XZ), align the Zenith Dot (Cross)
    if (this.zenithDot) {
        // The cross is originally built where arms are in XZ plane.
        // And position is (0,2,0).
        // If we just lookAt(target), the "forward" vector (-Z usually in Three) points to target.
        // Wait, default +Z is Forward? No, Three.js default lookAt uses -Z as forward.
        // If I built NS arm along Z axis.
        // World North is hNorth.
        // If I lookAt(pos + hNorth). The object's -Z axis will point to hNorth.
        // If my NS arm is along Z. Then +Z points AWAY from North. -Z points TO North.
        // This is correct alignment for North-South arm.
        
        // EW arm is along X.
        // If -Z points North. Then +X points West?
        // Right Hand Rule: X cross Y = Z.
        // If -Z is North (Forward). Y is Up.
        // Then X is Right?
        // North (0,0,-1). Up (0,1,0). North x Up = (-1,0,0) = -X = East?
        // Let's check coordinates.
        // In Three.js: +X Right, +Y Up, +Z Back (towards viewer).
        // -Z is Forward (into screen).
        // So North = -Z. East = +X?
        // Let's assume standard map.
        // hNorth is a vector.
        
        // Let's ensure alignment.
        const target = this.zenithDot.position.clone().add(hNorth);
        this.zenithDot.lookAt(target);
        
        // Wait, lookAt aligns the -Z axis of the object to point at target.
        // If I want the arm corresponding to global North to point North.
        // And the arm is the Z-axis box.
        // Then the Z-axis box aligns with North-South line. This works.
    }

    if (this.nadirDot) {
         this.nadirDot.position.copy(this.zenith).negate().multiplyScalar(2.0);
         const target = this.nadirDot.position.clone().add(hNorth);
         this.nadirDot.lookAt(target);
    }

    // 5. Setup Camera to look North, 15 degrees up
    const elevationAngle = THREE.MathUtils.degToRad(15);
    // View Vector: Combination of North (forward) and Up (Y)
    const viewDir = new THREE.Vector3()
        .copy(hNorth).multiplyScalar(Math.cos(elevationAngle))
        .add(worldUp.clone().multiplyScalar(Math.sin(elevationAngle)))
        .normalize();
    
    // Position camera slightly opposite to view direction to look at center? 
    // No, we are inside looking out. Camera at (0,0,0).
    // But OrbitControls works better if we look AT something.
    // Let's look FROM (0,0,0) towards 'viewDir'.
    // Actually OrbitControls rotates the Camera around Target.
    // If Target=(0,0,0) and Camera is at (0,0,0), it glitches.
    // Camera must be offset?
    // User wants to be "on the ground".
    // If the sphere is infinite (background), Position (0,0,0) is fine.
    // But `OrbitControls` rotates the CAMERA around TARGET.
    // If we want to simulate "Head Rotation", we should put Camera at (0,0,0) and Target at (0,0, -1).
    // Standard FirstView control.
    // BUT we are using `OrbitControls`.
    // Common trick: Camera at (0.01, 0, 0) looking at (0,0,0).
    // Then dragging rotates the world? 
    // OrbitControls: Dragging rotates the CAMERA around the TARGET.
    // If we want "Horizontal Drag = Horizontal Rotation", we want OrbitControls to orbit around Y-axis.
    // This works automatically if Camera Up is Y (Standard).
    
    const dist = 0.01;
    this.camera.position.copy(viewDir.clone().negate().multiplyScalar(dist));
    this.camera.up.set(0, 1, 0); // Enforce World Up
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    
    if ((this as any).controls) {
        const controls = (this as any).controls;
        controls.target.set(0, 0, 0); 
        controls.update();
    }

    // Force update markers after camera reset, ensuring they respect new orientation
    this.updateCardinalMarkers();
  }

  updateCardinalMarkers() {
    // Initialize if needed
    if (this.cardinalElements.length === 0) {
        const dirs = ['N', 'E', 'S', 'W'];
        dirs.forEach(d => {
            const div = document.createElement('div');
            div.textContent = d;
            div.style.position = 'absolute';
            // Style...
            div.style.width = '30px';
            div.style.height = '30px';
            div.style.lineHeight = '30px';
            div.style.textAlign = 'center';
            div.style.borderRadius = '50%';
            div.style.backgroundColor = '#ffffff'; // White circle
            div.style.color = '#000000'; // Text visible
            // div.style.fontFamily = 'serif';
            div.style.fontSize = '16px';
            div.style.fontWeight = 'bold';
            div.style.pointerEvents = 'none';
            div.style.display = 'none';
            // div.style.textShadow = '0 0 4px black';
            
            this.rendererContainer.nativeElement.appendChild(div);
            // Store...
            this.cardinalElements.push({ dir: d, element: div, position: new THREE.Vector3() });
        });
    }

    // Re-calculate horizon directions relative to the rotated Celestial Sphere.
    // The celestial objects are in 'this.celestialGroup', which is rotated.
    // The "North" direction on the ground points towards the Celestial North Pole (Local (0,0,1)).
    
    // 1. Get Celestial North Pole in World Space
    const localNorth = new THREE.Vector3(0, 0, 1);
    const worldNorth = localNorth.clone().applyQuaternion(this.celestialGroup.quaternion);
    
    // 2. Project World North onto Horizon Plane (World XZ plane, Normal = Y)
    // Since we aligned the zenith to World Up (0,1,0), the horizon is the XZ plane.
    const hNorth = new THREE.Vector3(worldNorth.x, 0, worldNorth.z).normalize();
    
    // Handle Pole singularity
    if (hNorth.lengthSq() < 0.001) {
       // At North Pole. WorldNorth approx (0,1,0).
       // Define arbitrary North for markers (e.g., -Z)
       hNorth.set(0, 0, -1); 
    }
    
    // 3. East is Cross Product of North and Up
    // World Up is (0,1,0).
    // hEast = hNorth x (0,1,0).
    const worldUp = new THREE.Vector3(0, 1, 0);
    const hEast = new THREE.Vector3().crossVectors(hNorth, worldUp).normalize();
    
    const hSouth = hNorth.clone().negate();
    const hWest = hEast.clone().negate();
    
    // Original radius was 500, same as horizon line. 
    // If div is appearing "above" (Y < expected Y_screen) or "floating", check alignment.
    // If horizon is at Y=0, and points are at Y=0.
    // Maybe radius 500 is too far if horizon curve is seen differently?
    // Actually, horizon is a sphere or disk at Y=0.
    // The visual horizon line is at radius 500.
    // If the div is "floating", it means its projected Y is higher (smaller value) than the line.
    
    // Maybe we should push them slightly OUT or DOWN to align?
    // Or just trust the math 500.
    const radius = 500; 
    
    this.cardinalElements.forEach(item => {
        let dirVec = new THREE.Vector3();
        if (item.dir === 'N') dirVec = hNorth;
        else if (item.dir === 'E') dirVec = hEast;
        else if (item.dir === 'S') dirVec = hSouth;
        else if (item.dir === 'W') dirVec = hWest;
        
        item.position.copy(dirVec).multiplyScalar(radius);
    });
    
    this.updateLabelPositions();
  }



  updateZenithLabels() {
    this.zenithLabelSprites.forEach(item => {
        let text = item.dir;
        if (this.language === 'zh') {
            if (item.dir === 'N') text = '北';
            else if (item.dir === 'S') text = '南';
            else if (item.dir === 'W') text = '西';
            else if (item.dir === 'E') text = '东';
        } else {
            // Ensure revert to English if toggled back
            if (item.dir === 'N') text = 'N';
            else if (item.dir === 'S') text = 'S';
            else if (item.dir === 'W') text = 'W';
            else if (item.dir === 'E') text = 'E';
        }
        this.updateSpriteTexture(item.sprite, text);
    });
  }

  updateNadirLabels() {
    this.nadirLabelSprites.forEach(item => {
        let text = item.dir;
        if (this.language === 'zh') {
            if (item.dir === 'N') text = '北';
            else if (item.dir === 'S') text = '南';
            else if (item.dir === 'W') text = '西';
            else if (item.dir === 'E') text = '东';
        } else {
            if (item.dir === 'N') text = 'N';
            else if (item.dir === 'S') text = 'S';
            else if (item.dir === 'W') text = 'W';
            else if (item.dir === 'E') text = 'E';
        }
        this.updateSpriteTexture(item.sprite, text);
    });
  }

  updateSpriteTexture(sprite: THREE.Sprite, text: string) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, 64, 64);
            context.font = 'Bold 40px Arial';
            context.fillStyle = '#cccccc';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, 32, 32);
        }
        const texture = new THREE.CanvasTexture(canvas);
        
        // Dispose old texture if possible to avoid leak
        if (sprite.material.map) {
             sprite.material.map.dispose();
        }
        
        sprite.material.map = texture;
        sprite.material.needsUpdate = true;
  }

  // Method to update label positions when the camera changes
  onCameraChange() {
    // console.log('camera changes')
    this.lastCameraMoveTime = Date.now();
    this.updateLabelPositions();
    this.checkConstellationsNearCenter();
    if(this.camera) {
        const {x, y, z} = this.camera.position;
        this.cameraPositionText = `(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`;
    }
  }

  //lines 时间 5秒
  animateLines() {
    const isIdle = Date.now() - this.lastCameraMoveTime > 5000;

    this.constellationLines.forEach((item: any) => {
        if (!item || !item.mesh) return;

        const material = item.mesh.material;
        const constellationName = item.data.en;
        
        let isActive = false;
        if (this.showConstellationLines) {
             // If "always show" is ON, we show everything.
             // Otherwise, only show active ones when user is moving (not idle).
             if (this.lineVisibilityMode === 'always') {
                 isActive = true;
             }
             else if (this.activeConstellations.has(constellationName) && !isIdle) {
                 isActive = true;
             }
        }

        // Animate Opacity
        const targetOpacity = isActive ? 0.5 : 0;
        
        // Linear interpolation for smooth fade
        // Use slower speed for fading out (0.005) vs fading in (0.05)
        const fadeSpeed = isActive ? 0.05 : 0.005;
        
        if (Math.abs(material.opacity - targetOpacity) > 0.001) {
            material.opacity += (targetOpacity - material.opacity) * fadeSpeed;
            material.needsUpdate = true;
        }

        // Optimization: Set visible to false if opacity is very low
        if (material.opacity < 0.01) {
            item.mesh.visible = false;
            // Reset state when hidden
            item.currentDrawCount = 0;
            item.mesh.geometry.setDrawRange(0, 0);
        } else {
            item.mesh.visible = true;

            if (isActive) {
                // Slower animation: 0.2 vertices per frame = 1 vertex every 5 frames
                // Since 2 vertices = 1 line, this means 10 frames (1/6 sec) per line.
                if (item.currentDrawCount < item.maxDrawCount) {
                    item.currentDrawCount += 0.2;
                    
                    // Constrain to even numbers for LineSegments
                    const count = Math.floor(item.currentDrawCount / 2) * 2;
                    item.mesh.geometry.setDrawRange(0, count);
                }
            }
        }
    });

  }

  animateStars() {
    const time = Date.now() * 0.003; 
    
    this.stars.forEach((star: any) => {
        // g < 3 means high brightness (lower mag is brighter)
        // Check both 'g' (new data) and fallback to 'b' if needed, though we normalized logic above
        // We stored starPosition in star.userData
        let gMag = star.userData.g;
        if (gMag === undefined && star.userData.b !== undefined) {
             // Fallback: b was ~ 22 - g
             gMag = 22 - star.userData.b;
        }

        // Apply brightness adjustment for twinkling threshold too?
        // If we make stars brighter (adjustment > 0), effective mag decreases.
        // effectiveMag = gMag - this.brightnessAdjustment
        // So if gMag=6, adj=4 -> effective=2 -> should twinkle?
        // User request: "make all the starts brighter". 
        // It implies visual brightness. Twinkling is a property of "bright" stars in this app.
        // Let's use adjusted mag for consistency.
        
        const effectiveMag = (gMag !== undefined) ? (gMag - this.brightnessAdjustment) : undefined;

        // If effectiveMag is present and less than 3 (very bright stars)
        if (effectiveMag !== undefined && effectiveMag < 3.0) {
            // Unique phase for each star based on its ID
            const phase = star.id * 13.0; // Prime number to avoid sync
            
            // Creates a pulsating effect using sine wave
            // Scale varies relative to baseScale (0.8x to 1.4x)
            const baseScale = star.userData.baseScale || 1.0;
            const factor = 1.1 + Math.sin(time + phase) * 0.3; 
            const scale = baseScale * factor;
            
            star.scale.set(scale, scale, scale);
        } else {
            // Reset to base scale (not 1,1,1) if it exists, otherwise 1
            const baseScale = star.userData.baseScale || 1.0;
            star.scale.set(baseScale, baseScale, baseScale);
        }
    });
  }

  checkConstellationsNearCenter() {
      if (!this.showConstellationLines) return;
      
      const center = new THREE.Vector2(0, 0); // NDC center
      // Clear current active set
      this.activeConstellations.clear();
      
      this.constellations.forEach(constellation => {
          let isNear = false;
          
          // We need to use valid star meshes to get world positions safely
          // Iterate over the stars array we created, or finding them by user data
          // But iterating over ALL stars is slow.
          // Let's rely on coordinate transform.
          
          /* 
             CRITICAL FIX: 
             The previous code was:
             const starWorldPos = new THREE.Vector3(star.x * resizetimes, star.y * resizetimes, star.z * resizetimes);
             
             BUT 'star' here is the raw JSON data {x,y,z...}.
             The actual Meshes are inside 'this.celestialGroup'.
             And 'this.celestialGroup' IS ROTATED by 'updateLocation'.
             
             So raw (x,y,z) is in LOCAL space of the group.
             We must transform it to WORLD space using the group's matrix.
          */
          
          const resizetimes = 10;

          for (const starDate of constellation.stars) {
             // 1. Get Local Position (Relative to Group)
             const localPos = new THREE.Vector3(
                 starDate.x * resizetimes, 
                 starDate.y * resizetimes, 
                 starDate.z * resizetimes
             );
             
             // 2. Transform to World Space
             // We can manually apply quaternion or use matrixWorld if updated.
             // Relying on quaternion is safer if matrixWorld isn't updated this frame yet.
             // localPos.applyMatrix4(this.celestialGroup.matrixWorld);
             // safer:
             localPos.applyQuaternion(this.celestialGroup.quaternion);
             localPos.add(this.celestialGroup.position); // Usually (0,0,0) but aiming for completeness
             
             const starWorldPos = localPos;
             
             // 3. Project to NDC
             const screenPos = starWorldPos.clone().project(this.camera); 
             
             // screenPos is in NDC: x[-1, 1], y[-1, 1], z[-1, 1] (if within frustum)
             // Check if within frustum (z < 1) and near center (distance < threshold)
             const distance = new THREE.Vector2(screenPos.x, screenPos.y).distanceTo(center);
             
             if (screenPos.z < 1 && Math.abs(screenPos.z) < 1 && distance < this.centerThreshold) {
                 isNear = true;
                 break; 
             }
          }
          
          if (isNear) {
              this.activeConstellations.add(constellation.en);
          }
      });
  }




  onConfigChange() {
    this.saveConfig();
    this.updateLabelPositions();
    this.updateZenithLabels();
    this.updateNadirLabels();
    this.updateStarBrightness();
    this.updateInteractionGuideVisibility();
  }

  updateInteractionGuideVisibility() {
      const guide = document.getElementById('interaction-guide');
      if (guide) {
          guide.style.display = this.showInteractionGuide ? 'block' : 'none';
      }
  }

  updateStarBrightness() {
    this.stars.forEach((star: any) => {
        const starPosition = star.userData;
        
        // Get base magnitude
        let gMag = starPosition.g;
        if (gMag === undefined || gMag === null) {
            if (starPosition.b !== undefined) {
               gMag = 22 - starPosition.b;
            } else {
               gMag = 6;
            }
        }

        // Apply brightness adjustment
        // Slider > 0 (Right) -> Make stars brighter -> Subtract from Magnitude (lower mag = brighter)
        // Slider < 0 (Left) -> Make stars fainter -> Add to Magnitude
        // The slider ranges -5 to 5.
        // If slider is 5, we subtract 5 from mag -> mag becomes smaller -> brighter.
        // If slider is -5, we add 5 to mag -> mag becomes larger -> fainter.
        // Adjustment: original_mag - slider_value
        
        let adjustedGMag = gMag - this.brightnessAdjustment; // Correct logic

        // Recalculate color
        let normalizedBrightness = 1.2 - (adjustedGMag * 0.15);
        normalizedBrightness = Math.max(0.1, Math.min(1.0, normalizedBrightness));
        
        const colorValue = normalizedBrightness;
        if (star.material) {
             star.material.color.setRGB(colorValue, colorValue, colorValue);
        }
        
        // Recalculate Size (Scale) based on magnitude
        // Brighter stars (lower mag) -> Larger scale
        // Fainter stars (higher mag) -> Smaller scale
        // Formula: Base scale around 1.5 for mag 2. 
        // Example: 2.2 - (mag * 0.2)
        // Mag 0 -> 2.2
        // Mag 5 -> 1.2
        // Mag 10 -> 0.2 (clamp to min)
        let scale = 2.2 - (adjustedGMag * 0.25);
        scale = Math.max(0.6, Math.min(4.0, scale)); // Clamp scale between 0.6 and 4.0
        
        star.userData.baseScale = scale;
        star.scale.set(scale, scale, scale);

    });
  }

  // Optimized version just for cardinal markers (for smooth animation loop)
  updateCardinalMarkersPositionsOnly() {
    if (!this.camera || !this.rendererContainer) return;
    
    // Update Cardinal Markers
    this.cardinalElements.forEach(item => {
        const div = item.element;
        // Project position to screen space. Camera matrixWorldInverse IS view matrix.
        // matrixWorldInverse IS updated by renderer.render, BUT inside animate loop 
        // we might call this BEFORE relevant updates if matrices are dirty?
        // Actually renderer.render usually updates matrices.
        // We are calling this AFTER renderer.render in animate loop? 
        // Yes, line 286: renderer.render(...), line 291: this.updateCardinalMarkersPositionsOnly().
        // So matrices are fresh.
        
        const vec = item.position.clone().project(this.camera);

        if (vec.z < 1 && vec.x >= -1 && vec.x <= 1 && vec.y >= -1 && vec.y <= 1) {
            div.style.display = 'block';
            const container = this.rendererContainer.nativeElement;
            const w = container.clientWidth / 2;
            const h = container.clientHeight / 2;
            
            // Ensure visual alignment with horizon line
            const x = (vec.x * w + w);
            const y = (-vec.y * h + h);
            
            div.style.left = `${x}px`;
            div.style.top = `${y}px`;
            // Center the div on the line
            // If it appears too high (floating), push it down slightly.
            // 'translate(-50%, -15%)' moves the div DOWN relative to its anchor point.
            // (Center anchor -50% pushes it UP half its height. -15% pushes it up LESS -> lower position)
            div.style.transform = 'translate(-50%, -50%)';
            
            // Text content update is static (done elsewhere), pure position update here.
        } else {
            div.style.display = 'none';
        }
    });
  }

  updateLabelPositions() {
    const tempVec = new THREE.Vector3();

    // Update Star Labels
    this.stars.forEach((star: any) => {
      // star is a THREE.Mesh or THREE.Object3D inside celestialGroup
      if (star.getWorldPosition) {
          star.getWorldPosition(tempVec);
      } else {
          // Fallback if structured differently
          tempVec.copy(star.position); 
          if(this.celestialGroup) tempVec.applyMatrix4(this.celestialGroup.matrixWorld);
      }
      
      const starName = star.name;
      const nameLabel = document.getElementById(starName);

      if (nameLabel) {
         if (!this.showLabels) {
            nameLabel.style.display = 'none';
         } else {
            const vector = tempVec.clone().project(this.camera);

            if (vector.z < 1 && vector.x >= -1 && vector.x <= 1 && vector.y >= -1 && vector.y <= 1) {
              nameLabel.style.display = 'block';

              // Display Logic: Use user data for clean names
              let displayName = star.userData.en || star.userData.name || starName.replace('star_', '');
              let zhName = star.userData.zh || displayName;

              const replaceGreek = (str: string) => {
                  if (!str) return str;
                  // Replace "alf Constellation" with just "α"
                                    if (str.match(/^alf\s+\w+/i)) return 'α';
                  if (str.match(/^bet\s+\w+/i)) return 'β';
                  if (str.match(/^gam\s+\w+/i)) return 'γ';
                  if (str.match(/^del\s+\w+/i)) return 'δ';
                  if (str.match(/^eps\s+\w+/i)) return 'ε';
                  if (str.match(/^zet\s+\w+/i)) return 'ζ';
                  if (str.match(/^eta\s+\w+/i)) return 'η';
                  if (str.match(/^the\s+\w+/i)) return 'θ';
                  if (str.match(/^iot\s+\w+/i)) return 'ι';
                  if (str.match(/^kap\s+\w+/i)) return 'κ';
                  if (str.match(/^lam\s+\w+/i)) return 'λ';
                  if (str.match(/^mu\s+\w+/i)) return 'μ';
                  if (str.match(/^nu\s+\w+/i)) return 'ν';
                  if (str.match(/^xi\s+\w+/i)) return 'ξ';
                  if (str.match(/^omi\s+\w+/i)) return 'ο';
                  if (str.match(/^pi\s+\w+/i)) return 'π';
                  if (str.match(/^rho\s+\w+/i)) return 'ρ';
                  if (str.match(/^sig\s+\w+/i)) return 'σ';
                  if (str.match(/^tau\s+\w+/i)) return 'τ';
                  if (str.match(/^ups\s+\w+/i)) return 'υ';
                  if (str.match(/^phi\s+\w+/i)) return 'φ';
                  if (str.match(/^chi\s+\w+/i)) return 'χ';
                  if (str.match(/^psi\s+\w+/i)) return 'ψ';
                  if (str.match(/^ome\s+\w+/i)) return 'ω';
                  
                  return str;
              };

              if (this.language === 'zh') {
                // Determine Chinese name
                let zhText = star.userData.zh;
                if (!zhText) {
                    // Fallback heirarchy: zh -> en -> name -> id
                    zhText = star.userData.en || star.userData.name || starName.replace('star_', '');
                }
                nameLabel.textContent = zhText;
              } else {
                nameLabel.textContent = replaceGreek(displayName);
              }

              const container = this.rendererContainer.nativeElement;
              const widthHalf = container.clientWidth / 2;
              const heightHalf = container.clientHeight / 2;

              const x = (vector.x * widthHalf) + widthHalf;
              const y = -(vector.y * heightHalf) + heightHalf;

              nameLabel.style.left = `${x}px`;
              nameLabel.style.top = `${y}px`;
              nameLabel.style.transform = 'translate(-50%, -50%)'; 
            } else {
              nameLabel.style.display = 'none';
            }
         }
      }
    });

    // Update Cardinal Markers
    this.cardinalElements.forEach(item => {
        const div = item.element;
        // item.position IS World Space
        const vec = item.position.clone().project(this.camera);

        if (vec.z < 1 && vec.x >= -1 && vec.x <= 1 && vec.y >= -1 && vec.y <= 1) {
            div.style.display = 'block';
            const container = this.rendererContainer.nativeElement;
            const w = container.offsetWidth / 2;
            const h = container.offsetHeight / 2;
            
            const x = (vec.x * w + w);
            const y = (-vec.y * h + h);
            
            div.style.left = `${x}px`;
            div.style.top = `${y}px`;
            // div.style.transform = 'translate(-50%, -50%)'; 
            // Slightly nudge down (15% vs -50%) to counteract perceived float
            div.style.transform = 'translate(-50%, -50%)'; 
            
            if (this.language === 'zh') {
                switch(item.dir) {
                    case 'N': div.textContent = '北'; break;
                    case 'E': div.textContent = '东'; break;
                    case 'S': div.textContent = '南'; break;
                    case 'W': div.textContent = '西'; break;
                }
            } else {
                div.textContent = item.dir;
            }
        } else {
            div.style.display = 'none';
        }
    });

    // Update Constellation Labels
    this.constellationElements.forEach((item: any) => {
        const label = item.element;
        const mesh = item.mesh; 
        const data = item.data;
        
        if (!this.showConstellationNames) {
            label.style.display = 'none';
        } else {
            if (mesh) {
                mesh.getWorldPosition(tempVec);
                const vector = tempVec.clone().project(this.camera);
                
                if (vector.z < 1 && vector.x >= -1 && vector.x <= 1 && vector.y >= -1 && vector.y <= 1) {
                    label.style.display = 'block';
                    label.textContent = this.language === 'zh' ? (data.zh || data.en) : (data.en || data.name);
                    
                    const container = this.rendererContainer.nativeElement;
                    const widthHalf = container.offsetWidth / 2;
                    const heightHalf = container.offsetHeight / 2;
                    
                    const x = (vector.x * widthHalf + widthHalf); 
                    const y = (-vector.y * heightHalf + heightHalf);

                    label.style.left = `${x}px`;
                    label.style.top = `${y}px`;
                    label.style.marginTop = '-20px'; 
                } else {
                    label.style.display = 'none';
                }
            }
        }
    });

    // Update Constellation Lines Visibility
    this.constellationLines.forEach((lines: any) => {
        lines.visible = this.showConstellationLines;
    });

  }


}

