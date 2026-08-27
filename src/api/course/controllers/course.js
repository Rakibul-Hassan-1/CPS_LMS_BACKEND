'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { canManageCourse } = require('../../../utils/permissions');

const FIND_POPULATE = {
  owner: { fields: ['id', 'username', 'email'] },
  lessons: true,
  quizzes: true,
};

const FIND_ONE_POPULATE = {
  owner: { fields: ['id', 'username', 'email'] },
  lessons: true,
  quizzes: { populate: ['questions'] },
};

module.exports = createCoreController('api::course.course', ({ strapi }) => ({
  // NOTE: we bypass the default super.find()/findOne() here on purpose.
  // Mutating ctx.query.populate and calling super.find() was unreliable
  // (Koa re-serializes ctx.query internally and can drop nested populate
  // objects), which caused lessons/quizzes/owner to silently come back
  // empty even though they existed in the database. Going straight through
  // entityService avoids that entirely and always returns the full data.
  async find(ctx) {
    const courses = await strapi.entityService.findMany('api::course.course', {
      populate: FIND_POPULATE,
      sort: { createdAt: 'desc' },
    });
    return { data: courses, meta: {} };
  },

  async findOne(ctx) {
    const course = await strapi.entityService.findOne('api::course.course', ctx.params.id, {
      populate: FIND_ONE_POPULATE,
    });
    if (!course) return ctx.notFound('Course not found');
    return { data: course };
  },

  async create(ctx) {
    const user = ctx.state.user;
    ctx.request.body.data = {
      ...ctx.request.body.data,
      owner: user.id,
    };
    const created = await super.create(ctx);
    const full = await strapi.entityService.findOne('api::course.course', created.data.id, {
      populate: FIND_ONE_POPULATE,
    });
    return { data: full };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;
    const existing = await strapi.entityService.findOne('api::course.course', id, { populate: ['owner'] });
    if (!existing) return ctx.notFound('Course not found');

    const allowed = await canManageCourse(strapi, user, existing);
    if (!allowed) return ctx.forbidden('You can only manage your own courses');

    await super.update(ctx);
    const full = await strapi.entityService.findOne('api::course.course', id, { populate: FIND_ONE_POPULATE });
    return { data: full };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;
    const existing = await strapi.entityService.findOne('api::course.course', id, { populate: ['owner'] });
    if (!existing) return ctx.notFound('Course not found');

    const allowed = await canManageCourse(strapi, user, existing);
    if (!allowed) return ctx.forbidden('You can only manage your own courses');

    return super.delete(ctx);
  },
}));