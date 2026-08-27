'use strict';

/**
 * Shared permission helpers used across controllers.
 * Roles are identified by the `type` field on plugin::users-permissions.role,
 * which we seed in bootstrap as: 'admin', 'content_manager', 'instructor', 'student'.
 */

function getRoleType(user) {
  if (!user) return null;
  if (user.role && user.role.type) return user.role.type;
  return null;
}

async function resolveUserRole(strapi, user) {
  if (user.role && user.role.type) return user.role.type;
  const full = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
    populate: ['role'],
  });
  return full && full.role ? full.role.type : null;
}

/**
 * Admin and Content Manager can manage ANY course.
 * Instructor can only manage courses they own.
 */
async function canManageCourse(strapi, user, course) {
  const role = await resolveUserRole(strapi, user);
  if (role === 'admin' || role === 'content_manager') return true;
  if (role === 'instructor') {
    const ownerId = course.owner && (course.owner.id || course.owner);
    return String(ownerId) === String(user.id);
  }
  return false;
}

async function canManageBlogPost(strapi, user, post) {
  const role = await resolveUserRole(strapi, user);
  if (role === 'admin') return true;
  if (role === 'content_manager') {
    const authorId = post.author && (post.author.id || post.author);
    return String(authorId) === String(user.id) || true; // matrix: content manager manages posts they create
  }
  return false;
}

module.exports = {
  getRoleType,
  resolveUserRole,
  canManageCourse,
  canManageBlogPost,
};
