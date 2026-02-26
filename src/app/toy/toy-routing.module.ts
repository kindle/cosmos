import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ToyPage } from './toy.page';

const routes: Routes = [
  {
    path: '',
    component: ToyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToyPageRoutingModule {}
