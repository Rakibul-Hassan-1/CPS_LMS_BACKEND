'use strict';
const { createCoreController } = require('@strapi/strapi').factories;
const { canManageBlogPost, resolveUserRole } = require('../../../utils/permissions');

module.exports = createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const role = user ? await resolveUserRole(strapi, user) : null;
    const canSeeDrafts = role === 'admin' || role === 'content_manager';

    ctx.query = {
      ...ctx.query,
      filters: canSeeDrafts ? ctx.query.filters : { ...ctx.query.filters, status: 'published' },
      populate: ctx.query.populate || ['author'],
    };
    return super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const role = user ? await resolveUserRole(strapi, user) : null;
    const canSeeDrafts = role === 'admin' || role === 'content_manager';

    const post = await strapi.entityService.findOne('api::blog-post.blog-post', ctx.params.id, { populate: ['author'] });
    if (!post) return ctx.notFound();
    if (post.status !== 'published' && !canSeeDrafts) {
      // Allow the author to preview their own draft
      const isAuthor = post.author && String(post.author.id) === String(user && user.id);
      if (!isAuthor) return ctx.notFound();
    }
    return { data: post };
  },

  async create(ctx) {
    const user = ctx.state.user;
    ctx.request.body.data = { ...ctx.request.body.data, author: user.id };
    if (ctx.request.body.data.status === 'published' && !ctx.request.body.data.publishedDate) {
      ctx.request.body.data.publishedDate = new Date();
    }
    return super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const post = await strapi.entityService.findOne('api::blog-post.blog-post', ctx.params.id, { populate: ['author'] });
    if (!post) return ctx.notFound();
    const allowed = await canManageBlogPost(strapi, user, post);
    if (!allowed) return ctx.forbidden('You cannot edit this post');

    if (ctx.request.body.data && ctx.request.body.data.status === 'published' && post.status !== 'published') {
      ctx.request.body.data.publishedDate = new Date();
    }
    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const post = await strapi.entityService.findOne('api::blog-post.blog-post', ctx.params.id, { populate: ['author'] });
    if (!post) return ctx.notFound();
    const allowed = await canManageBlogPost(strapi, user, post);
    if (!allowed) return ctx.forbidden('You cannot delete this post');
    return super.delete(ctx);
  },
}));
