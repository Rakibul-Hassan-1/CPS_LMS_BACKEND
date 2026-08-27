'use strict';

const ROLES_MANAGE = { name: 'global::has-role', config: { roles: ['admin', 'content_manager', 'instructor'] } };

module.exports = {
  routes: [
    { method: 'GET', path: '/courses', handler: 'course.find', config: { policies: [] } },
    { method: 'GET', path: '/courses/:id', handler: 'course.findOne', config: { policies: [] } },
    {
      method: 'POST',
      path: '/courses',
      handler: 'course.create',
      config: { policies: ['global::is-authenticated', ROLES_MANAGE] },
    },
    {
      method: 'PUT',
      path: '/courses/:id',
      handler: 'course.update',
      config: { policies: ['global::is-authenticated', ROLES_MANAGE] },
    },
    {
      method: 'DELETE',
      path: '/courses/:id',
      handler: 'course.delete',
      config: { policies: ['global::is-authenticated', ROLES_MANAGE] },
    },
  ],
};
