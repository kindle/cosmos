import { Injectable, NgModule } from '@angular/core';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// import 'hammerjs';

// @Injectable()
// export class MyHammerConfig extends HammerGestureConfig {
//   override overrides = <any> {
//     'pan': { direction: 6 }, // 6 = Hammer.DIRECTION_HORIZONTAL | Hammer.DIRECTION_VERTICAL
//     'pinch': { enable: false },
//     'rotate': { enable: false }
//   }
// }

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    //{ provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
