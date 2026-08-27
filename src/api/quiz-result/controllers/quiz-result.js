'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
  async submit(ctx) {
    const user = ctx.state.user;
    const { quizId, answers } = ctx.request.body; // answers: [{ questionId, selectedIndex }]
    if (!quizId || !Array.isArray(answers)) return ctx.badRequest('quizId and answers[] are required');

    const quiz = await strapi.entityService.findOne('api::quiz.quiz', quizId, { populate: { questions: true, course: true } });
    if (!quiz) return ctx.notFound('Quiz not found');

    // Must be enrolled in the course to take the quiz
    const enrolled = await strapi.entityService.findMany('api::enrollment.enrollment', {
      filters: { student: user.id, course: quiz.course.id },
    });
    if (!enrolled || enrolled.length === 0) return ctx.forbidden('You are not enrolled in this course');

    const questions = quiz.questions || [];
    let score = 0;
    const gradedAnswers = questions.map((q) => {
      const submitted = answers.find((a) => String(a.questionId) === String(q.id));
      const selectedIndex = submitted ? submitted.selectedIndex : null;
      const isCorrect = selectedIndex !== null && Number(selectedIndex) === Number(q.correctIndex);
      if (isCorrect) score += 1;
      return { questionId: q.id, selectedIndex, correctIndex: q.correctIndex, isCorrect };
    });

    const result = await strapi.entityService.create('api::quiz-result.quiz-result', {
      data: {
        student: user.id,
        quiz: quizId,
        score,
        total: questions.length,
        answers: gradedAnswers,
        submittedAt: new Date(),
      },
    });

    return { data: { resultId: result.id, score, total: questions.length, answers: gradedAnswers } };
  },

  async myResults(ctx) {
    const user = ctx.state.user;
    const results = await strapi.entityService.findMany('api::quiz-result.quiz-result', {
      filters: { student: user.id },
      populate: { quiz: { populate: ['course'] } },
      sort: { submittedAt: 'desc' },
    });
    return { data: results };
  },
}));
