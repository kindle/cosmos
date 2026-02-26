import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SkyPageRoutingModule } from './sky-routing.module';

import { SkyPage } from './sky.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SkyPageRoutingModule
  ],
  declarations: [SkyPage]
})
export class SkyPageModule {}
