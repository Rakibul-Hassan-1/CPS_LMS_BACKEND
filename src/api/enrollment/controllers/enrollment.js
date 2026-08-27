'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async enroll(ctx) {
    const user = ctx.state.user;
    const courseId = ctx.request.body.courseId || (ctx.request.body.data && ctx.request.body.data.course);
    if (!courseId) return ctx.badRequest('courseId is required');

    const course = await strapi.entityService.findOne('api::course.course', courseId);
    if (!course) return ctx.notFound('Course not found');

    const existing = await strapi.entityService.findMany('api::enrollment.enrollment', {
      filters: { student: user.id, course: courseId },
    });
    if (existing && existing.length > 0) {
      return ctx.badRequest('Already enrolled in this course');
    }

    const enrollment = await strapi.entityService.create('api::enrollment.enrollment', {
      data: { student: user.id, course: courseId, enrolledAt: new Date() },
      populate: ['course'],
    });
    return { data: enrollment };
  },

  async myCourses(ctx) {
    const user = ctx.state.user;
    const enrollments = await strapi.entityService.findMany('api::enrollment.enrollment', {
      filters: { student: user.id },
      populate: { course: { populate: ['lessons'] } },
    });

    const results = await Promise.all(
      enrollments.map(async (e) => {
        const totalLessons = (e.course.lessons || []).length;
        const doneCount = await strapi.entityService.count('api::lesson-progress.lesson-progress', {
          filters: { student: user.id, course: e.course.id, completed: true },
        });
        const percentage = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
        return {
          enrollmentId: e.id,
          enrolledAt: e.enrolledAt,
          course: { id: e.course.id, title: e.course.title, description: e.course.description },
          progress: { completed: doneCount, total: totalLessons, percentage },
        };
      })
    );

    return { data: results };
  },
}));
