import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ToyPageRoutingModule } from './toy-routing.module';

import { ToyPage } from './toy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ToyPageRoutingModule
  ],
  declarations: [ToyPage]
})
export class ToyPageModule {}
