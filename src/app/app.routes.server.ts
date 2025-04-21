import { RenderMode, ServerRoute } from '@angular/ssr';

// export const serverRoutes: ServerRoute[] = [
//   {
//     path: '**',
//     renderMode: RenderMode.Prerender
//   }
// ];
export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/detail/:id',
    renderMode: RenderMode.Server  // 👈 disables prerendering for this route
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
