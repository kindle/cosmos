import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ZodiacPage } from './zodiac.page';

const routes: Routes = [
  {
    path: '',
    component: ZodiacPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ZodiacPageRoutingModule {}
