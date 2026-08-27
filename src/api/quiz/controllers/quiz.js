'use strict';
const { createCoreController } = require('@strapi/strapi').factories;
const { canManageCourse, resolveUserRole } = require('../../../utils/permissions');

module.exports = createCoreController('api::quiz.quiz', ({ strapi }) => ({
  // Bypassing super.find()/findOne() for the same reason as the course
  // controller: mutating ctx.query and calling the core controller was
  // unreliable for nested populate objects. entityService is direct and
  // always returns the full related data.
  async find(ctx) {
    const filters = {};
    // Support the one filter this app actually needs: ?filters[course][id][$eq]=<id>
    const courseId =
      ctx.query.filters &&
      ctx.query.filters.course &&
      ctx.query.filters.course.id &&
      ctx.query.filters.course.id.$eq;
    if (courseId) filters.course = courseId;

    const quizzes = await strapi.entityService.findMany('api::quiz.quiz', {
      filters,
      populate: { course: true, questions: true },
    });
    return { data: quizzes, meta: {} };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const role = await resolveUserRole(strapi, user);
    const quiz = await strapi.entityService.findOne('api::quiz.quiz', ctx.params.id, {
      populate: { questions: true, course: true },
    });
    if (!quiz) return ctx.notFound();

    if (role === 'student') {
      const sanitized = {
        ...quiz,
        questions: (quiz.questions || []).map((q) => ({ id: q.id, text: q.text, options: q.options })),
      };
      return { data: sanitized };
    }
    return { data: quiz };
  },

  async create(ctx) {
    const user = ctx.state.user;
    const courseId = ctx.request.body.data && ctx.request.body.data.course;
    if (!courseId) return ctx.badRequest('course is required');
    const course = await strapi.entityService.findOne('api::course.course', courseId, { populate: ['owner'] });
    if (!course) return ctx.notFound('Course not found');
    const allowed = await canManageCourse(strapi, user, course);
    if (!allowed) return ctx.forbidden('You cannot add a quiz to this course');
    const created = await super.create(ctx);
    const full = await strapi.entityService.findOne('api::quiz.quiz', created.data.id, {
      populate: { course: true, questions: true },
    });
    return { data: full };
  },

  async update(ctx) {
    const user = ctx.state.user;
    const quiz = await strapi.entityService.findOne('api::quiz.quiz', ctx.params.id, { populate: { course: { populate: ['owner'] } } });
    if (!quiz) return ctx.notFound();
    const allowed = await canManageCourse(strapi, user, quiz.course);
    if (!allowed) return ctx.forbidden('You cannot edit this quiz');
    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const quiz = await strapi.entityService.findOne('api::quiz.quiz', ctx.params.id, { populate: { course: { populate: ['owner'] } } });
    if (!quiz) return ctx.notFound();
    const allowed = await canManageCourse(strapi, user, quiz.course);
    if (!allowed) return ctx.forbidden('You cannot delete this quiz');
    return super.delete(ctx);
  },
}));