'use strict';
const ROLES_MANAGE = { name: 'global::has-role', config: { roles: ['admin', 'content_manager', 'instructor'] } };

module.exports = {
  routes: [
    { method: 'POST', path: '/questions', handler: 'question.create', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
    { method: 'PUT', path: '/questions/:id', handler: 'question.update', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
    { method: 'DELETE', path: '/questions/:id', handler: 'question.delete', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
  ],
};
