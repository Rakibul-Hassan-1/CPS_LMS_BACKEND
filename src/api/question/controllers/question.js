'use strict';
const { createCoreController } = require('@strapi/strapi').factories;
const { canManageCourse } = require('../../../utils/permissions');

async function getCourseForQuiz(strapi, quizId) {
  const quiz = await strapi.entityService.findOne('api::quiz.quiz', quizId, { populate: { course: { populate: ['owner'] } } });
  return quiz ? quiz.course : null;
}

module.exports = createCoreController('api::question.question', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    const quizId = ctx.request.body.data && ctx.request.body.data.quiz;
    if (!quizId) return ctx.badRequest('quiz is required');
    const course = await getCourseForQuiz(strapi, quizId);
    if (!course) return ctx.notFound('Quiz/course not found');
    const allowed = await canManageCourse(strapi, user, course);
    if (!allowed) return ctx.forbidden('You cannot add questions to this quiz');
    return super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const question = await strapi.entityService.findOne('api::question.question', ctx.params.id, { populate: ['quiz'] });
    if (!question) return ctx.notFound();
    const course = await getCourseForQuiz(strapi, question.quiz.id);
    const allowed = await canManageCourse(strapi, user, course);
    if (!allowed) return ctx.forbidden('You cannot edit this question');
    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const question = await strapi.entityService.findOne('api::question.question', ctx.params.id, { populate: ['quiz'] });
    if (!question) return ctx.notFound();
    const course = await getCourseForQuiz(strapi, question.quiz.id);
    const allowed = await canManageCourse(strapi, user, course);
    if (!allowed) return ctx.forbidden('You cannot delete this question');
    return super.delete(ctx);
  },
}));
