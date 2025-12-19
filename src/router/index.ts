import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/router/routes'
import { history } from '@/router/history'

export const router = createRouter({
  routeTree,
  history,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
