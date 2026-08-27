'use strict';
const ADMIN_ONLY = { name: 'global::has-role', config: { roles: ['admin'] } };

module.exports = {
  routes: [
    { method: 'GET', path: '/platform/users', handler: 'platform.listUsers', config: { policies: ['global::is-authenticated', ADMIN_ONLY] } },
    { method: 'PUT', path: '/platform/users/:id/role', handler: 'platform.updateUserRole', config: { policies: ['global::is-authenticated', ADMIN_ONLY] } },
    { method: 'GET', path: '/platform/roles', handler: 'platform.listRoles', config: { policies: ['global::is-authenticated', ADMIN_ONLY] } },
    { method: 'GET', path: '/platform/stats', handler: 'platform.stats', config: { policies: ['global::is-authenticated', ADMIN_ONLY] } },
  ],
};
