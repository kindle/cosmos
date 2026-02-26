import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as dat from 'dat.gui';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.page.html',
  styleUrls: ['./tree.page.scss'],
})
export class TreePage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement>|any;
  
  private application: Application|any;
  private gui: dat.GUI|any;

  constructor() { }

  ngOnInit() {
    console.log('TreePage ngOnInit');
  }

  ngAfterViewInit() {
    //Create a new instance of the application
    this.application = new Application(this.canvasRef.nativeElement);

    //Initialize all planets for the first time
    this.application.solarSystem.initializePlanets(this.application.center);

    //Initialize the dat.GUI object and assign the variables that the user can adjust
    this.gui = new dat.GUI();
    this.gui.add(settings, 'spawnMass', 5, 200);
    this.gui.add(settings, 'amountOfPredictions', 50, 500);
    this.gui.add(settings, 'pauseWhileAiming');
    
    // We bind 'reset' to the application instance context
    const controls = {
      reset: () => this.application.reset()
    };
    this.gui.add(controls, 'reset');
    
    //Start the initial loop function for the first time
    this.application.loop();
  }

  ngOnDestroy() {
    if (this.gui) {
      this.gui.destroy();
    }
    if (this.application) {
      this.application.destroy();
    }
  }
}

/**
 * Constants
 */
const TWO_PI = Math.PI * 2;
const ALLOWED_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Simple settings objects so we can easily mutate these values using dat.gui
 */
const settings = {
    spawnMass: 25,
    pauseWhileAiming: false,
    amountOfPredictions: 200
};

/**
 * Application Class
 * The heart of the application and responsible for initializing all objects and updating/rendering them
 */
class Application {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D|any;
    width: number;
    height: number;
    center: { x: number, y: number };
    solarSystem: SolarSystem;
    planetLauncher: PlanetLauncher;
    animationFrameId: number|any;

    /**
     * Application constructor
     */
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.center = {
            x: this.width / 2,
            y: this.height / 2
        };

        this.solarSystem = new SolarSystem();
        this.planetLauncher = new PlanetLauncher(this.canvas, this.solarSystem);

        //Resize listener for the canvas to fill the browser window dynamically
        window.addEventListener('resize', this.resizeHandler, false);
    }

    private resizeHandler = () => this.resizeCanvas();

    /**
     * Simple resize function. Reinitializing everything on the canvas while changing the width/height
     */
    resizeCanvas() {
        //Recalculate the width and height of the canvas and thus the center of the canvas as well
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.center = {
            x: this.width / 2,
            y: this.height / 2
        };

        this.reset();
    }

    /**
     * Updates the application and every child of the application
     */
    update() {
        if (settings.pauseWhileAiming === false) {
            this.solarSystem.update();
        } else if (settings.pauseWhileAiming === true && this.planetLauncher.isMouseDown === false) {
            this.solarSystem.update();
        }

        this.planetLauncher.update();
    }

    /**
     * Renders the application and every child of the application
     */
    render() {
        //Clear the entire canvas to make it empty for the new render loop
        this.context.clearRect(0, 0, this.width, this.height);

        this.solarSystem.render(this.context);
        this.planetLauncher.render(this.context);
    }

    /**
     * Update and render the application at least 60 times a second
     */
    loop() {
        this.update();
        this.render();

        this.animationFrameId = window.requestAnimationFrame(() => this.loop());
    }

    /**
     * Throw all planets away and initialize a whole new array of planets
     */
    reset() {
        this.solarSystem.planets = [];
        this.solarSystem.initializePlanets(this.center);
    }

    destroy() {
        window.cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('resize', this.resizeHandler);
        this.planetLauncher.destroy();
    }
}

/**
 * SolarSystem class
 * Is responsible for maintaining and updating all of it's planets
 */
class SolarSystem {
    planets: Planet[];

    /**
     * SolarSystem constructor
     */
    constructor() {
        this.planets = [];
    }

    /**
     * Initialize the planets container by filling it with Planet objects
     */
    initializePlanets(center: { x: number, y: number }) {
        this.planets.push(new Planet(center.x, center.y, 0, 0, 200));
        this.planets.push(new Planet(center.x, center.y - 150, 1.1, 0, 25));
        this.planets.push(new Planet(center.x + 70, center.y - 90, 1.45, Math.PI, 25));
        this.planets.push(new Planet(center.x - 180, center.y + 160, 1, Math.PI / 1.4, 25));
        this.planets.push(new Planet(center.x - 150, center.y + 100, 1.1, Math.PI * 2.4, 75));
    }

    /**
     * Updates the application and every child of the application
     */
    update() {
        //Keep an array of all destroyed planets, because we don't want to mutate the planets array while calculating all values
        let destroyedPlanets = [];

        for (let i = 0; i < this.planets.length; i++) {
            //If the planet collides with another planet, don't bother continuing the gravity calculations for this planet
            if (SolarSystem.collidesWithAnotherPlanet(this.planets[i], this.planets) === true) {
                destroyedPlanets.push(i);
                continue;
            }

            //Calculate the total gravitational pull from all the other planets in the solar system
            let gravitationalPull = SolarSystem.gravitationalPullFromOtherPlanets(this.planets[i], this.planets);

            //Update the current planet by changing it's position based on it's velocity
            this.planets[i].accelerate(gravitationalPull);
            this.planets[i].update();
        }

        //Remove all planets that should be destroyed, because they've hit something during this update loop
        for (let i = 0; i < destroyedPlanets.length; i++) {
            this.planets.splice(destroyedPlanets[i], 1);
        }
    }

    /**
     * Renders the SolarSystem and every child of the application
     */
    render(context: CanvasRenderingContext2D) {
        for (let i = 0; i < this.planets.length; i++) {
            this.planets[i].render(context);
        }
    }

    /**
     * Check whether one planet collides with another planet
     */
    static collidesWithAnotherPlanet(planet: Planet, planets: Planet[]) {
        for (let i = 0; i < planets.length; i++) {
            //We don't want to check for collision with the same planet. A planet can't hit itself
            if (planet.name === planets[i].name) {
                continue;
            }

            //If the other planet is bigger than the current planet, don't bother checking for collisions
            if (planets[i].mass <= planet.mass) {
                continue;
            }

            //Check if the current planet hits the other planet
            if (SolarSystem.hasCollisionBetween(planet, planets[i])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate the gravitational pull on one planet based on distance to other planets
     */
    static gravitationalPullFromOtherPlanets(planet: Planet, planets: Planet[]) {
        let totalGravitationalPull = new Vector2D(0, 0);

        for (let i = 0; i < planets.length; i++) {
            //We don't want to check for gravitational pull on the same planet, neither should a planet collide with itself
            if (planet.name === planets[i].name) {
                continue;
            }

            //If the other planet's mass is smaller than the current planets mass, don't bother to check for gravity changes.
            //A bigger planet shouldn't be affected by a very small planet, as this isn't a scientifically accurate representation of the galaxy.
            if (planets[i].mass <= planet.mass) {
                continue;
            }

            //Calculate the gravitationalPull on the current planet
            totalGravitationalPull.addTo(SolarSystem.gravitationalPull(planet, planets[i]));
        }

        return totalGravitationalPull;
    }

    /**
     * If the current planet hits a bigger planet, it should be destroyed by impact
     * I calculate this by doing a simple check on the distance and the radii of both planets
     */
    static hasCollisionBetween(currentPlanet: Planet, otherPlanet: Planet) {
        let distanceTo = SolarSystem.distanceBetween(currentPlanet, otherPlanet);

        //If the current planet hits a bigger planet, it should be destroyed by impact
        //I calculate this by doing a simple check on the distance and the radii of both planets
        return (distanceTo <= (otherPlanet.radius + currentPlanet.radius));
    }

    /**
     * Calculate the gravitational pull on the current planet based on the other planet's mass and distance between the two planets
     */
    static gravitationalPull(currentPlanet: Planet, otherPlanet: Planet) {
        //Calculate the angle and distance between the current planet and the current other planet
        let angle = SolarSystem.angleBetween(currentPlanet, otherPlanet);
        let distanceTo = SolarSystem.distanceBetween(currentPlanet, otherPlanet);

        //Create a new gravity Vector2D that will affect the current planet's velocity
        //Set the angle and length of the gravity vector. The length is based on the mass of the other planet and the distance between the current planet and that planet.
        let gravity = new Vector2D(0, 0);
        gravity.setLength(otherPlanet.mass / (distanceTo * distanceTo));
        gravity.setAngle(angle);

        //Return the gravitational pull that is applied the current planet by the other planet
        return gravity;
    }

    /**
     * Calculate the distance between the current planet and the current other planet
     */
    static distanceBetween(currentPlanet: Planet, otherPlanet: Planet) {
        //Calculate the difference in position for the horizontal and the vertical axis
        let dx = otherPlanet.position.getX() - currentPlanet.position.getX();
        let dy = otherPlanet.position.getY() - currentPlanet.position.getY();

        //Calculate the distance between the current planet and the current other planet
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate the angle between the current planet and the current other planet
     */
    static angleBetween(currentPlanet: Planet, otherPlanet: Planet) {
        //Calculate the difference in position for the horizontal and the vertical axis
        let dx = otherPlanet.position.getX() - currentPlanet.position.getX();
        let dy = otherPlanet.position.getY() - currentPlanet.position.getY();

        return Math.atan2(dy, dx);
    }
}

/**
 * Planet Class
 */
class Planet {
    name: string;
    position: Vector2D;
    velocity: Vector2D;
    mass: number;
    radius: number;
    sunlitRadius: number;
    radialDifference: number;
    color: number;

    /**
     * Planet constructor
     */
    constructor(x: number, y: number, speed: number, direction: number, mass: number) {
        this.name = Utils.randomString(10);
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.velocity.setLength(speed);
        this.velocity.setAngle(direction);
        this.mass = mass;

        this.radius = mass / 5;
        this.sunlitRadius = mass / 6;
        this.radialDifference = this.radius - this.sunlitRadius;
        this.color = Utils.getRandomInt(0, 360);
    }

    /**
     * Update the planet by changing it's position based on it's velocity
     */
    update() {
        this.position.addTo(this.velocity);
    }

    /**
     * Renders the planet
     */
    render(context: CanvasRenderingContext2D) {
        //Draw the unlit part of the planet
        context.fillStyle = 'hsla(' + this.color + ', 70%, 51%, 1)';
        context.beginPath();
        context.arc(this.position.getX(), this.position.getY(), this.radius, 0, TWO_PI);
        context.fill();

        //Draw the lit part of the planet
        context.fillStyle = 'hsla(' + this.color + ', 100%, 63%, 1)';
        context.beginPath();
        context.arc(this.position.getX() - (this.radialDifference / 2), this.position.getY() - (this.radialDifference / 2), this.sunlitRadius, 0, TWO_PI);
        context.fill();
    }

    /**
     * Add a Vector2D to the current planet's velocity
     */
    accelerate(acceleration: Vector2D) {
        this.velocity.addTo(acceleration);
    }
}

/**
 * PlanetLauncher class
 * Is responsible for the user interaction and spawning new planets
 */
class PlanetLauncher {
    solarSystem: SolarSystem;
    mousePosition: { x: number, y: number };
    isMouseDown: boolean;
    mouseDownPosition: { x: number, y: number } | null;
    pathLocations: any[];
    canvas: HTMLCanvasElement;

    private mouseMoveHandler: (e: MouseEvent) => void;
    private mouseDownHandler: (e: MouseEvent) => void;
    private mouseUpHandler: (e: MouseEvent) => void;
    private touchStartHandler: (e: TouchEvent) => void;
    private touchEndHandler: (e: TouchEvent) => void;
    private touchMoveHandler: (e: TouchEvent) => void;

    /**
     * PlanetLauncher constructor
     */
    constructor(canvas: HTMLCanvasElement, solarSystem: SolarSystem) {
        this.canvas = canvas;
        this.solarSystem = solarSystem;

        //Set an initial mouse position that is certainly off screen
        this.mousePosition = {
            x: -100,
            y: -100
        };
        this.isMouseDown = false;
        this.mouseDownPosition = null;
        this.pathLocations = [];

        // Bind handlers so we can remove them later
        this.mouseMoveHandler = (e: MouseEvent) => this.mouseMove(e);
        this.mouseDownHandler = (e: MouseEvent) => this.mouseDown(e);
        this.mouseUpHandler = (e: MouseEvent) => this.mouseUp(e);
        this.touchStartHandler = (e: TouchEvent) => this.touchStart(e);
        this.touchEndHandler = (e: TouchEvent) => this.touchEnd(e);
        this.touchMoveHandler = (e: TouchEvent) => this.touchMove(e);

        //Attach all event listeners needed for the PlanetLauncher
        window.addEventListener('mousemove', this.mouseMoveHandler, false);
        canvas.addEventListener('mousedown', this.mouseDownHandler, false);
        canvas.addEventListener('mouseup', this.mouseUpHandler, false);
        canvas.addEventListener("touchstart", this.touchStartHandler, false);
        canvas.addEventListener("touchend", this.touchEndHandler, false);
        canvas.addEventListener("touchmove", this.touchMoveHandler, false);
    }

    destroy() {
        window.removeEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
        this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
        this.canvas.removeEventListener("touchstart", this.touchStartHandler);
        this.canvas.removeEventListener("touchend", this.touchEndHandler);
        this.canvas.removeEventListener("touchmove", this.touchMoveHandler);
    }

    /**
     * Checks whether the user holds his mouse down (or touches the screen). If so, initialises the path predictions so they can be rendered
     */
    update() {
        //If the user isn't holding it's mouse down we don't have to bother predicting the planets positions
        if (this.isMouseDown === false) {
            return;
        }

        //Define the pathLocations array which will hold all the future positions for each planet
        this.pathLocations = [];

        if (!this.mouseDownPosition) return;

        //Calculate the difference in position for the horizontal and the vertical axis
        let dx = this.mouseDownPosition.x - this.mousePosition.x;
        let dy = this.mouseDownPosition.y - this.mousePosition.y;

        //Create a temporary planet object that we can insert in the solar system to perform our calculations
        this.solarSystem.planets.push(new Planet(
            this.mouseDownPosition.x,
            this.mouseDownPosition.y,
            Math.sqrt(dx * dx + dy * dy) / 100,
            Math.atan2(dy, dx),
            settings.spawnMass
        ));

        //Define the positions and velocities array so we can restore these values later on on the planets
        let positions: Vector2D[] = [];
        let velocities: Vector2D[] = [];

        //Loop through each planet and backup their position and velocity
        for (let i = 0; i < this.solarSystem.planets.length; i++) {
            positions[i] = this.solarSystem.planets[i].position.add(new Vector2D(0, 0));
            velocities[i] = this.solarSystem.planets[i].velocity.add(new Vector2D(0, 0));
        }

        //Keep an array of all destroyed planets, because we don't want to mutate the planets array while calculating all values
        let destroyedPlanets = [];

        //Loop as many times as we wan't to predict the future path of our planets
        for (let c = 0; c < settings.amountOfPredictions; c++) {
            //For every check we have to loop through each planet and check them against the other planets
            for (let i = 0; i < this.solarSystem.planets.length; i++) {
                //Make sure the pathLocations array is always initialized with a new empty array
                //because we are going to push predicted locations in a separate array for each planet
                if (typeof this.pathLocations[i] === 'undefined') {
                    this.pathLocations[i] = [];
                }

                //If this planet is already predicted to be destroyed by a previous run, don't bother checking again
                if (destroyedPlanets.indexOf(i) !== -1) {
                    continue;
                }

                //If the planet collides with another planet, don't bother continuing the gravity calculations for this planet
                if (SolarSystem.collidesWithAnotherPlanet(this.solarSystem.planets[i], this.solarSystem.planets) === true) {
                    destroyedPlanets.push(i);
                    continue;
                }

                //Calculate the total gravitational pull from all the other planets in the solar system
                let gravitationalPull = SolarSystem.gravitationalPullFromOtherPlanets(this.solarSystem.planets[i], this.solarSystem.planets);

                //Update the current planet by changing it's position based on it's velocity
                this.solarSystem.planets[i].accelerate(gravitationalPull);
                this.solarSystem.planets[i].update();

                //Store the newly predicted position in an array for this specific planet, so we can render it in the render function
                this.pathLocations[i].push({
                    x: this.solarSystem.planets[i].position.getX(),
                    y: this.solarSystem.planets[i].position.getY(),
                    color: this.solarSystem.planets[i].color
                });
            }
        }

        //Restore the original positions and velocities of each planet
        for (let i = 0; i < this.solarSystem.planets.length; i++) {
            this.solarSystem.planets[i].position = positions[i];
            this.solarSystem.planets[i].velocity = velocities[i];
        }

        //Remove our temporary planet from the solar system
        this.solarSystem.planets.splice(this.solarSystem.planets.length - 1, 1);
    }

    /**
     * Renders the application and every child of the application
     */
    render(context: CanvasRenderingContext2D) {
        if (this.isMouseDown == false) {
            context.strokeStyle = 'hsla(0, 100%, 100%, 0.5)';
            context.beginPath();
            context.arc(this.mousePosition.x, this.mousePosition.y, settings.spawnMass / 5, 0, TWO_PI);
            context.stroke();
        } else {
            if (!this.mouseDownPosition) return;

            context.strokeStyle = 'hsla(0, 100%, 100%, 1)';
            context.beginPath();
            context.arc(this.mouseDownPosition.x, this.mouseDownPosition.y, settings.spawnMass / 5, 0, TWO_PI);
            context.stroke();

            context.beginPath();
            context.moveTo(this.mousePosition.x, this.mousePosition.y);
            context.lineTo(this.mouseDownPosition.x, this.mouseDownPosition.y);
            context.closePath();
            context.stroke();

            for (let i = 0; i < this.pathLocations.length; i++) {
                for (let j = 1; j < this.pathLocations[i].length; j += 1) {
                    if (i === this.pathLocations.length - 1) {
                        context.strokeStyle = 'hsla(0, 100%, 100%, 0.5)';
                        context.lineWidth = 3;
                    } else {
                        context.strokeStyle = 'hsla(' + this.pathLocations[i][j].color + ', 100%, 63%, 0.2)';
                        context.lineWidth = 1;
                    }

                    context.beginPath();
                    context.moveTo(this.pathLocations[i][j - 1].x, this.pathLocations[i][j - 1].y);
                    context.lineTo(this.pathLocations[i][j].x, this.pathLocations[i][j].y);
                    context.closePath();
                    context.stroke();
                }

                if (this.pathLocations[i].length < settings.amountOfPredictions && this.pathLocations[i].length > 0) {
                    context.beginPath();
                    context.moveTo(this.pathLocations[i][this.pathLocations[i].length - 1].x - 5, this.pathLocations[i][this.pathLocations[i].length - 1].y - 5);
                    context.lineTo(this.pathLocations[i][this.pathLocations[i].length - 1].x + 5, this.pathLocations[i][this.pathLocations[i].length - 1].y + 5);
                    context.closePath();
                    context.stroke();

                    context.beginPath();
                    context.moveTo(this.pathLocations[i][this.pathLocations[i].length - 1].x + 5, this.pathLocations[i][this.pathLocations[i].length - 1].y - 5);
                    context.lineTo(this.pathLocations[i][this.pathLocations[i].length - 1].x - 5, this.pathLocations[i][this.pathLocations[i].length - 1].y + 5);
                    context.closePath();
                    context.stroke();
                }
            }
        }
    }

    touchStart(event: TouchEvent) {
        event.preventDefault();

        if (this.isMouseDown) {
            return;
        }

        this.isMouseDown = true;
        this.mousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
        this.mouseDownPosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }

    touchMove(event: TouchEvent) {
        event.preventDefault();

        this.mousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
    
    // Adjusted mouse events to use clientX and clientY from MouseEvent
    mouseMove(event: MouseEvent) {
        event.preventDefault();

        this.mousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    mouseDown(event: MouseEvent) {
        event.preventDefault();

        if (this.isMouseDown) {
            return;
        }

        this.isMouseDown = true;
        this.mouseDownPosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    mouseUp(event: MouseEvent) {
        event.preventDefault();

        this.isMouseDown = false;

        if (!this.mouseDownPosition) return;

        //Calculate the difference in position for the horizontal and the vertical axis
        let dx = this.mouseDownPosition.x - this.mousePosition.x;
        let dy = this.mouseDownPosition.y - this.mousePosition.y;

        //Insert our new planet in the solar system based on the calculated speed and angle
        this.solarSystem.planets.push(new Planet(
            this.mouseDownPosition.x,
            this.mouseDownPosition.y,
            Math.sqrt(dx * dx + dy * dy) / 100,
            Math.atan2(dy, dx),
            settings.spawnMass
        ));
    }

    touchEnd(event: TouchEvent) {
        this.isMouseDown = false;
        
        if (!this.mouseDownPosition) return;

        //Calculate the difference in position for the horizontal and the vertical axis
        let dx = this.mouseDownPosition.x - this.mousePosition.x;
        let dy = this.mouseDownPosition.y - this.mousePosition.y;

        //Insert our new planet in the solar system based on the calculated speed and angle
        this.solarSystem.planets.push(new Planet(
            this.mouseDownPosition.x,
            this.mouseDownPosition.y,
            Math.sqrt(dx * dx + dy * dy) / 100,
            Math.atan2(dy, dx),
            settings.spawnMass
        ));

        //Make sure the mouse position is offscreen again so the user doesn't see the aim pointer on mobile
        this.mousePosition = {
            x: -100,
            y: -100
        };
    }
}

/**
 * Vector2D class
 */
class Vector2D {
    _x: number;
    _y: number;

    /**
     * Vector constructor
     */
    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    setX(x: number) {
        this._x = x;
    }

    setY(y: number) {
        this._y = y;
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    setAngle(angle: number) {
        let length = this.getLength();
        this._x = Math.cos(angle) * length;
        this._y = Math.sin(angle) * length;
    }

    getAngle() {
        return Math.atan2(this._y, this._x);
    }

    setLength(length: number) {
        let angle = this.getAngle();
        this._x = Math.cos(angle) * length;
        this._y = Math.sin(angle) * length;
    }

    getLength() {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }

    add(v2: Vector2D) {
        return new Vector2D(this._x + v2.getX(), this._y + v2.getY());
    }

    subtract(v2: Vector2D) {
        return new Vector2D(this._x - v2.getX(), this._y - v2.getY());
    }

    multiply(value: number) {
        return new Vector2D(this._x * value, this._y * value);
    }

    divide(value: number) {
        return new Vector2D(this._x / value, this._y / value);
    }

    addTo(v2: Vector2D) {
        this._x += v2.getX();
        this._y += v2.getY();
    }

    subtractFrom(v2: Vector2D) {
        this._x -= v2.getX();
        this._y -= v2.getY();
    }

    multiplyBy(value: number) {
        this._x *= value;
        this._y *= value;
    }

    divideBy(value: number) {
        this._x /= value;
        this._y /= value;
    }
}

/**
 * Utilities Class has some functions that are needed throughout the entire application
 */
class Utils {
    /**
     * Returns a random integer between a given minimum and maximum value
     */
    static getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Create a random string
     */
    static randomString(length: number) {
        let text = "";

        for (let i = 0; i < length; i++) {
            text += ALLOWED_CHARACTERS.charAt(Math.floor(Math.random() * ALLOWED_CHARACTERS.length));
        }

        return text;
    }
}
