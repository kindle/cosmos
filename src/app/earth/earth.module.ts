import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EarthPageRoutingModule } from './earth-routing.module';

import { EarthPage } from './earth.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EarthPageRoutingModule
  ],
  declarations: [EarthPage]
})
export class EarthPageModule {}
