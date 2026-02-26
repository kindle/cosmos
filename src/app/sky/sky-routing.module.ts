import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SkyPage } from './sky.page';

const routes: Routes = [
  {
    path: '',
    component: SkyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SkyPageRoutingModule {}
