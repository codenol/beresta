import { createRouter, createWebHistory } from 'vue-router'

import EditorView from './views/EditorView.vue'
import WorkspaceLayout from './layouts/WorkspaceLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: EditorView },
    { path: '/demo', component: EditorView, meta: { demo: true } },
    { path: '/share/:roomId', component: EditorView },

    // Top-level: Project Navigator
    {
      path: '/projects',
      component: () => import('./views/ProjectNavigatorView.vue'),
    },

    // Top-level: Library (global, shared across all projects)
    {
      path: '/library',
      component: () => import('./views/workspaces/LibraryWorkspaceView.vue'),
    },

    // Workspace pipeline (4 steps)
    {
      path: '/workspace',
      component: WorkspaceLayout,
      children: [
        { path: '', redirect: '/projects' },
        {
          path: 'analytics',
          component: () => import('./views/workspaces/AnalyticsView.vue'),
        },
        {
          path: 'design',
          component: () => import('./views/workspaces/DesignWorkspaceView.vue'),
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
