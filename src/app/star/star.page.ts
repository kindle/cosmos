import { Component, Inject, OnInit, Renderer2 } from '@angular/core';

interface Star {
  giant: boolean;
  comet: boolean;
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  fadingOut: boolean | null;
  fadingIn: boolean;
  opacity: number;
  opacityTresh: number;
  do: number;
  reset: (t:any) => void;
  fadeIn: (t:any) => void;
  fadeOut: (t:any) => void;
  draw: (t:any) => void;
  move: (t:any) => void;
}

@Component({
  selector: 'app-star',
  templateUrl: './star.page.html',
  styleUrls: ['./star.page.scss'],
})
export class StarPage implements OnInit {
  
  constructor(
    //private _renderer2: Renderer2,
    //@Inject(DOCUMENT) private _document: Document,
    //private router: Router,
    ) {}

    universe: CanvasRenderingContext2D|any;
    starDensity: number = 0.216;
    speedCoeff: number = 0.05;
    width: number|any;
    height: number|any;
    starCount: number|any;
    circleRadius: number|any;
    circleCenter: { x: number; y: number }|any;
    first: boolean = true;
    giantColor: string = '180,184,240';
    starColor: string = '226,225,142';
    cometColor: string = '226,225,224';
    canva: HTMLCanvasElement|any;
    stars: Star[] = [];

    windowResizeHandler() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.starCount = this.width * this.starDensity;
      this.circleRadius = this.width > this.height ? this.height / 2 : this.width / 2;
      this.circleCenter = {
          x: this.width / 2,
          y: this.height / 2,
      };

      this.canva.width = this.width;
      this.canva.height = this.height;
    }

    ngOnInit(){
      this.canva = document.getElementById('universe') as HTMLCanvasElement;
      this.windowResizeHandler();
      window.addEventListener('resize', ()=>{this.windowResizeHandler()}, false);
      this.createUniverse();
      
      setTimeout(()=> {
            this.first = false;
      }, 50);
    }


    createUniverse() {
      this.universe = this.canva.getContext('2d')!;
      this.starCount = this.width * this.starDensity;

      for (let i = 0; i < this.starCount; i++) {
          const newStar = this.createStar();
          this.stars.push(newStar);
          newStar.reset(this);
      }

      this.draw();
    }

    createStar(): Star {
      return {
          giant: this.getProbability(3),
          comet: false,
          x: 0,
          y: 0,
          r: 0,
          dx: 0,
          dy: 0,
          fadingOut: null,
          fadingIn: true,
          opacity: 0,
          opacityTresh: this.getRandInterval(0.2, 1 - 0.4),
          do: this.getRandInterval(0.0005, 0.002),
          reset(t:any) {
              this.giant = t.getProbability(3);
              this.comet = this.giant || t.first ? false : t.getProbability(10);
              this.x = t.getRandInterval(0, t.width - 10);
              this.y = t.getRandInterval(0, t.height);
              this.r = t.getRandInterval(1.1, 2.6);
              this.dx =
                  t.getRandInterval(t.speedCoeff, 6 * t.speedCoeff) +
                  (this.comet ? 1 : 0) * t.speedCoeff * t.getRandInterval(50, 120) +
                  t.speedCoeff * 2;
              this.dy = -(
                  t.getRandInterval(t.speedCoeff, 6 * t.speedCoeff) +
                  (this.comet ? 1 : 0) * t.speedCoeff * t.getRandInterval(50, 120)
              );
              this.fadingOut = null;
              this.fadingIn = true;
              this.opacity = 0;
              this.opacityTresh = t.getRandInterval(0.2, 1 - (this.comet ? 1 : 0) * 0.4);
              this.do = t.getRandInterval(0.0005, 0.002) + (this.comet ? 1 : 0) * 0.001;
          },
          fadeIn(t:any) {
              if (this.fadingIn) {
                  this.fadingIn = this.opacity > this.opacityTresh ? false : true;
                  this.opacity += this.do;
              }
          },
          fadeOut(t:any) {
              if (this.fadingOut) {
                  this.fadingOut = this.opacity < 0 ? false : true;
                  this.opacity -= this.do / 2;
                  if (this.x > t.width || this.y < 0) {
                      this.fadingOut = false;
                      this.reset(t);
                  }
              }
          },
          draw(t:any) {
              t.universe.beginPath();

              if (this.giant) {
                  t.universe.fillStyle = 'rgba(' + t.giantColor + ',' + this.opacity + ')';
                  t.universe.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
              } else if (this.comet) {
                  t.universe.fillStyle = 'rgba(' + t.cometColor + ',' + this.opacity + ')';
                  t.universe.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, false);

                  //comet tail
                  for (let i = 0; i < 30; i++) {
                    t.universe.fillStyle = 'rgba(' + t.cometColor + ',' + (this.opacity - (this.opacity / 20) * i) + ')';
                      t.universe.rect(this.x - this.dx / 4 * i, this.y - this.dy / 4 * i - 2, 2, 2);
                      t.universe.fill();
                  }
              } else {
                  t.universe.fillStyle = 'rgba(' + t.starColor + ',' + this.opacity + ')';
                  t.universe.rect(this.x, this.y, this.r, this.r);
              }

              t.universe.closePath();
              t.universe.fill();
          },
          move(t:any) {
              this.x += this.dx;
              this.y += this.dy;
              if (this.fadingOut === false) {
                  this.reset(t);
              }
              if (this.x > t.width - (t.width / 4) || this.y < 0) {
                  this.fadingOut = true;
              }
          },
      };
    }

    draw() {
      this.universe.clearRect(0, 0, this.width, this.height);

      const starsLength = this.stars.length;

      for (let i = 0; i < starsLength; i++) {
          const star = this.stars[i];
          star.move(this);
          star.fadeIn(this);
          star.fadeOut(this);
          star.draw(this);
      }

      window.requestAnimationFrame(()=>{this.draw()});
    }

    getProbability(percents: number): boolean {
      return Math.floor(Math.random() * 1000) + 1 < percents * 10;
    }

    getRandInterval(min: number, max: number): number {
      return Math.random() * (max - min) + min;
    }



  bgm(){
    /*
    this.reddah.playBgm = !this.reddah.playBgm;
    this.reddah.setBgm(this.reddah.playBgm);
    if(this.reddah.playBgm){
      (document.getElementById("bgm") as HTMLAudioElement).play();
    }
    else{ 
      (document.getElementById("bgm") as HTMLAudioElement).pause();
    }*/
  }

showFeauture = true;

selectedLocale:any;
changeLocale(selector: string) {
  //this.localStorageService.set("Reddah_Locale", selector);
  //this.selectedLocale = selector;
  //this.reddah.loadTranslate(selector);
  //this.reddah.clearLocaleCache();
  
  //await this.modalController.dismiss(selector!==this.orgLocale);
}
  
/*
  goClassic(){
    this.router.navigate(['/tabs/tab4task'], {
        queryParams: {
        }
    });
  }*/

  goAdventure(){
      /*this.router.navigate(['/tabs/tab2'], {
          queryParams: {
          }
      });*/
  }

  goFeedback(){
      //this.reddah.goFeedback();
  }

}










