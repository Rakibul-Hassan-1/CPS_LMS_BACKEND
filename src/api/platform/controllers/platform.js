'use strict';

module.exports = {
  async listUsers(ctx) {
    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
      populate: ['role'],
      fields: ['id', 'username', 'email', 'createdAt'],
    });
    return { data: users };
  },

  async listRoles(ctx) {
    const roles = await strapi.query('plugin::users-permissions.role').findMany({
      where: { type: { $in: ['admin', 'content_manager', 'instructor', 'student'] } },
    });
    return { data: roles };
  },

  async updateUserRole(ctx) {
    const { id } = ctx.params;
    const { roleType } = ctx.request.body; // e.g. 'instructor'
    const allowedTypes = ['admin', 'content_manager', 'instructor', 'student'];
    if (!allowedTypes.includes(roleType)) {
      return ctx.badRequest(`roleType must be one of: ${allowedTypes.join(', ')}`);
    }

    const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: roleType } });
    if (!role) return ctx.notFound('Role not found. Did the server bootstrap run?');

    const user = await strapi.entityService.update('plugin::users-permissions.user', id, {
      data: { role: role.id },
      populate: ['role'],
    });

    return { data: user };
  },

  async stats(ctx) {
    const users = await strapi.entityService.findMany('plugin::users-permissions.user', { populate: ['role'] });
    const usersByRole = {};
    for (const u of users) {
      const t = u.role ? u.role.type : 'unknown';
      usersByRole[t] = (usersByRole[t] || 0) + 1;
    }

    const totalCourses = await strapi.entityService.count('api::course.course');
    const totalLessons = await strapi.entityService.count('api::lesson.lesson');
    const totalEnrollments = await strapi.entityService.count('api::enrollment.enrollment');
    const totalQuizzes = await strapi.entityService.count('api::quiz.quiz');
    const totalBlogPosts = await strapi.entityService.count('api::blog-post.blog-post');
    const publishedBlogPosts = await strapi.entityService.count('api::blog-post.blog-post', { filters: { status: 'published' } });

    return {
      data: {
        totalUsers: users.length,
        usersByRole,
        totalCourses,
        totalLessons,
        totalEnrollments,
        totalQuizzes,
        totalBlogPosts,
        publishedBlogPosts,
      },
    };
  },
};
