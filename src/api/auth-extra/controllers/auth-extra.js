// 'use strict';

// /**
//  * Custom registration that lets a user pick their role at signup, restricted
//  * to the non-privileged application roles. The 'admin' role can only be
//  * granted by an existing admin via /api/platform/users/:id/role, or via the
//  * one-time bootstrap seed (see src/index.js + .env ADMIN_EMAIL/ADMIN_PASSWORD).
//  */
// module.exports = {
//   async register(ctx) {
//     const { username, email, password, role } = ctx.request.body;
//     const allowedSelfRoles = ['content_manager', 'instructor', 'student'];

//     if (!username || !email || !password) {
//       return ctx.badRequest('username, email and password are required');
//     }
//     const roleType = allowedSelfRoles.includes(role) ? role : 'student';

//     const existingEmail = await strapi.query('plugin::users-permissions.user').findOne({ where: { email: email.toLowerCase() } });
//     if (existingEmail) return ctx.badRequest('Email is already taken');

//     const existingUsername = await strapi.query('plugin::users-permissions.user').findOne({ where: { username } });
//     if (existingUsername) return ctx.badRequest('Username is already taken');

//     const roleEntity = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: roleType } });
//     if (!roleEntity) return ctx.badRequest('Role has not been provisioned yet. Please retry in a moment.');

//     const user = await strapi.entityService.create('plugin::users-permissions.user', {
//       data: {
//         username,
//         email: email.toLowerCase(),
//         password,
//         provider: 'local',
//         confirmed: true,
//         blocked: false,
//         role: roleEntity.id,
//       },
//       populate: ['role'],
//     });

//     const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

//     return {
//       jwt,
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: { id: user.role.id, name: user.role.name, type: user.role.type },
//       },
//     };
//   },
// };


'use strict';

/**
 * Custom registration that lets a user pick their role at signup, restricted
 * to the non-privileged application roles. The 'admin' role can only be
 * granted by an existing admin via /api/platform/users/:id/role, or via the
 * one-time bootstrap seed (see src/index.js + .env ADMIN_EMAIL/ADMIN_PASSWORD).
 */
module.exports = {
  async register(ctx) {
    const { username, email, password, role } = ctx.request.body;
    const allowedSelfRoles = ['content_manager', 'instructor', 'student'];

    if (!username || !email || !password) {
      return ctx.badRequest('username, email and password are required');
    }
    const roleType = allowedSelfRoles.includes(role) ? role : 'student';

    const existingEmail = await strapi.query('plugin::users-permissions.user').findOne({ where: { email: email.toLowerCase() } });
    if (existingEmail) return ctx.badRequest('Email is already taken');

    const existingUsername = await strapi.query('plugin::users-permissions.user').findOne({ where: { username } });
    if (existingUsername) return ctx.badRequest('Username is already taken');

    const roleEntity = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: roleType } });
    if (!roleEntity) return ctx.badRequest('Role has not been provisioned yet. Please retry in a moment.');

    const user = await strapi.entityService.create('plugin::users-permissions.user', {
      data: {
        username,
        email: email.toLowerCase(),
        password,
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: roleEntity.id,
      },
      populate: ['role'],
    });

    const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

    return {
      jwt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: { id: user.role.id, name: user.role.name, type: user.role.type },
      },
    };
  },

  // NOTE: Strapi's built-in GET /api/users/me?populate=role was unreliable
  // here (same class of issue as the course/quiz populate bugs - the
  // querystring populate silently didn't apply), so we expose our own
  // guaranteed-to-work "me" endpoint using entityService directly.
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const full = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
      populate: ['role'],
      fields: ['id', 'username', 'email'],
    });

    if (!full) return ctx.notFound();

    return {
      id: full.id,
      username: full.username,
      email: full.email,
      role: full.role ? { id: full.role.id, name: full.role.name, type: full.role.type } : null,
    };
  },
};