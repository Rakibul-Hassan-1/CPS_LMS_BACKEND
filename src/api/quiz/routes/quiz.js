'use strict';
const ROLES_MANAGE = { name: 'global::has-role', config: { roles: ['admin', 'content_manager', 'instructor'] } };

module.exports = {
  routes: [
    { method: 'GET', path: '/quizzes', handler: 'quiz.find', config: { policies: ['global::is-authenticated'] } },
    { method: 'GET', path: '/quizzes/:id', handler: 'quiz.findOne', config: { policies: ['global::is-authenticated'] } },
    { method: 'POST', path: '/quizzes', handler: 'quiz.create', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
    { method: 'PUT', path: '/quizzes/:id', handler: 'quiz.update', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
    { method: 'DELETE', path: '/quizzes/:id', handler: 'quiz.delete', config: { policies: ['global::is-authenticated', ROLES_MANAGE] } },
  ],
};
