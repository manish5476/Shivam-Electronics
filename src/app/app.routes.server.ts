import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  // {
  //   path: 'products/detail/:id',
  //   renderMode: RenderMode.Server  // 👈 ensures SSR, not prerender
  // },
];
