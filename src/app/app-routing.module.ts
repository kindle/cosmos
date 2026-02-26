import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'earth',
    loadChildren: () => import('./earth/earth.module').then( m => m.EarthPageModule)
  },
  {
    path: 'star',
    loadChildren: () => import('./star/star.module').then( m => m.StarPageModule)
  },
  {
    path: 'sky',
    loadChildren: () => import('./sky/sky.module').then( m => m.SkyPageModule)
  },
  {
    path: 'tree',
    loadChildren: () => import('./tree/tree.module').then( m => m.TreePageModule)
  },
  {
    path: 'toy',
    loadChildren: () => import('./toy/toy.module').then( m => m.ToyPageModule)
  },
  {
    path: 'zodiac',
    loadChildren: () => import('./zodiac/zodiac.module').then( m => m.ZodiacPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
