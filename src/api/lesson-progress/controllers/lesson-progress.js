'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

async function computePercentage(strapi, studentId, courseId) {
  const totalLessons = await strapi.entityService.count('api::lesson.lesson', { filters: { course: courseId } });
  const doneCount = await strapi.entityService.count('api::lesson-progress.lesson-progress', {
    filters: { student: studentId, course: courseId, completed: true },
  });
  const percentage = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
  return { completed: doneCount, total: totalLessons, percentage };
}

module.exports = createCoreController('api::lesson-progress.lesson-progress', ({ strapi }) => ({
  async markComplete(ctx) {
    const user = ctx.state.user;
    const { lessonId } = ctx.request.body;
    if (!lessonId) return ctx.badRequest('lessonId is required');

    const lesson = await strapi.entityService.findOne('api::lesson.lesson', lessonId, { populate: ['course'] });
    if (!lesson) return ctx.notFound('Lesson not found');

    // Ensure student is enrolled in the course
    const enrolled = await strapi.entityService.findMany('api::enrollment.enrollment', {
      filters: { student: user.id, course: lesson.course.id },
    });
    if (!enrolled || enrolled.length === 0) return ctx.forbidden('You are not enrolled in this course');

    const existing = await strapi.entityService.findMany('api::lesson-progress.lesson-progress', {
      filters: { student: user.id, lesson: lessonId },
    });

    let record;
    if (existing && existing.length > 0) {
      record = await strapi.entityService.update('api::lesson-progress.lesson-progress', existing[0].id, {
        data: { completed: true, completedAt: new Date() },
      });
    } else {
      record = await strapi.entityService.create('api::lesson-progress.lesson-progress', {
        data: { student: user.id, lesson: lessonId, course: lesson.course.id, completed: true, completedAt: new Date() },
      });
    }

    const progress = await computePercentage(strapi, user.id, lesson.course.id);
    return { data: { progressRecord: record, progress } };
  },

  async courseProgress(ctx) {
    const user = ctx.state.user;
    const { courseId } = ctx.params;
    const progress = await computePercentage(strapi, user.id, courseId);
    return { data: progress };
  },

  async studentProgressForInstructor(ctx) {
    const { studentId, courseId } = ctx.params;
    const progress = await computePercentage(strapi, studentId, courseId);
    return { data: progress };
  },
}));
