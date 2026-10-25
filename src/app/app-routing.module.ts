import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/categories/categories.module').then(m => m.CategoriesModule)
  },
  {
    path: 'categories',
    children: [
      {
        path: '',
        loadChildren: () => import('./features/categories/categories.module').then(m => m.CategoriesModule)
      },
      {
        path: ':categoryUid/products',
        loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule),
        data: { categoryUid: ':categoryUid' }
      }
    ]
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule)
  },
  {
    path: 'varieties',
    loadChildren: () => import('./features/varieties/varieties.module').then(m => m.VarietiesModule)
  },
  {
    path: 'pages',
    loadChildren: () => import('./features/pages/pages.module').then(m => m.PagesModule)
  },
  {
    path: 'session',
    loadChildren: () => import('./sessions/sessions.module').then(m => m.SessionsModule)
  },
  {
    path: 'about',
    redirectTo: '/pages/about',
    pathMatch: 'full'
  },
  {
    path: 'contact',
    redirectTo: '/pages/contact',
    pathMatch: 'full'
  },
   {
    path: 'new-home',
    redirectTo: '/pages/new-home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    redirectTo: '/session/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
