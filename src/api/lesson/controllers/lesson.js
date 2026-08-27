'use strict';
const { createCoreController } = require('@strapi/strapi').factories;
const { canManageCourse } = require('../../../utils/permissions');

async function getCourseForLesson(strapi, lessonId) {
  const lesson = await strapi.entityService.findOne('api::lesson.lesson', lessonId, { populate: { course: { populate: ['owner'] } } });
  return lesson ? lesson.course : null;
}

module.exports = createCoreController('api::lesson.lesson', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    const courseId = ctx.request.body.data && ctx.request.body.data.course;
    if (!courseId) return ctx.badRequest('course is required');
    const course = await strapi.entityService.findOne('api::course.course', courseId, { populate: ['owner'] });
    if (!course) return ctx.notFound('Course not found');
    const allowed = await canManageCourse(strapi, user, course);
    if (!allowed) return ctx.forbidden('You cannot add lessons to this course');
    return super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const course = await getCourseForLesson(strapi, ctx.params.id);
    if (!course) return ctx.notFound('Lesson/course not found');
    const allowed = await canManageCourse(strapi, user, course);
    if (!allowed) return ctx.forbidden('You cannot edit this lesson');
    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const course = await getCourseForLesson(strapi, ctx.params.id);
    if (!course) return ctx.notFound('Lesson/course not found');
    const allowed = await canManageCourse(strapi, user, course);
    if (!allowed) return ctx.forbidden('You cannot delete this lesson');
    return super.delete(ctx);
  },
}));
