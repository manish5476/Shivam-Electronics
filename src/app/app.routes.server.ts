import { RenderMode, ServerRoute } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  // {
  //   path: 'products/detail/:id',
  //   renderMode: RenderMode.Server  
  // },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
