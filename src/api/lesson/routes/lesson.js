'use strict';
const ROLES_MANAGE = { name: 'global::has-role', config: { roles: ['admin', 'content_manager', 'instructor'] } };

module.exports = {
  routes: [
    { method: 'GET', path: '/lessons', handler: 'lesson.find', config: { policies: ['global::is-authenticated'] } },
    { method: 'GET', path: '/lessons/:id', handler: 'lesson.findOne', config: { policies: ['global::is-authenticated'] } },
    { method: 'POST', path: '/lessons', handler: 'lesson.create', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
    { method: 'PUT', path: '/lessons/:id', handler: 'lesson.update', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
    { method: 'DELETE', path: '/lessons/:id', handler: 'lesson.delete', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
  ],
};
