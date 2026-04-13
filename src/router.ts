import { createRouter, createWebHistory } from 'vue-router'

import EditorView from './views/EditorView.vue'
import WorkspaceLayout from './layouts/WorkspaceLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: EditorView },
    { path: '/demo', component: EditorView, meta: { demo: true } },
    { path: '/share/:roomId', component: EditorView },
    {
      path: '/workspace',
      component: WorkspaceLayout,
      children: [
        { path: '', redirect: '/workspace/design' },
        {
          path: 'design',
          component: () => import('./views/workspaces/DesignWorkspaceView.vue'),
        },
        {
          path: 'analytics',
          component: () => import('./views/workspaces/AnalyticsView.vue'),
        },
        {
          path: 'library',
          component: () => import('./views/workspaces/LibraryWorkspaceView.vue'),
        },
        {
          path: 'preview',
          component: () => import('./views/workspaces/ReactPreviewView.vue'),
        },
        {
          path: 'discussion',
          component: () => import('./views/workspaces/DiscussionView.vue'),
        },
        {
          path: 'handoff',
          component: () => import('./views/workspaces/HandoffView.vue'),
        },
      ],
    },
  ],
})

export default router
