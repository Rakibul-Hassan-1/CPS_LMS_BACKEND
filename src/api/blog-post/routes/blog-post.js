'use strict';
const ROLES_MANAGE = { name: 'global::has-role', config: { roles: ['admin', 'content_manager'] } };

module.exports = {
  routes: [
    { method: 'GET', path: '/blog-posts', handler: 'blog-post.find', config: { policies: [] } },
    { method: 'GET', path: '/blog-posts/:id', handler: 'blog-post.findOne', config: { policies: [] } },
    { method: 'POST', path: '/blog-posts', handler: 'blog-post.create', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
    { method: 'PUT', path: '/blog-posts/:id', handler: 'blog-post.update', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
    { method: 'DELETE', path: '/blog-posts/:id', handler: 'blog-post.delete', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
  ],
};
