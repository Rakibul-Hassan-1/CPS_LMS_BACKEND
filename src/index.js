// 'use strict';

// const ROLE_DEFINITIONS = [
//   { name: 'Admin', type: 'admin', description: 'Full control of the LMS platform.' },
//   { name: 'Content Manager', type: 'content_manager', description: 'Manages the course & blog content library.' },
//   { name: 'Instructor', type: 'instructor', description: 'Manages their own courses, lessons, quizzes and students.' },
//   { name: 'Student', type: 'student', description: 'Enrolls in courses, learns and takes quizzes.' },
// ];

// const PERMISSIONS_MAP = {
//   public: [
//     'api::course.course.find', 'api::course.course.findOne',
//     'api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne',
//     'api::auth-extra.auth-extra.register',
//   ],
//   student: [
//     'api::course.course.find', 'api::course.course.findOne',
//     'api::lesson.lesson.find', 'api::lesson.lesson.findOne',
//     'api::enrollment.enrollment.enroll', 'api::enrollment.enrollment.myCourses',
//     'api::lesson-progress.lesson-progress.markComplete', 'api::lesson-progress.lesson-progress.courseProgress',
//     'api::quiz.quiz.find', 'api::quiz.quiz.findOne',
//     'api::quiz-result.quiz-result.submit', 'api::quiz-result.quiz-result.myResults',
//     'api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne',
//   ],
//   instructor: [
//     'api::course.course.find', 'api::course.course.findOne',
//     'api::course.course.create', 'api::course.course.update', 'api::course.course.delete',
//     'api::lesson.lesson.find', 'api::lesson.lesson.findOne',
//     'api::lesson.lesson.create', 'api::lesson.lesson.update', 'api::lesson.lesson.delete',
//     'api::quiz.quiz.find', 'api::quiz.quiz.findOne',
//     'api::quiz.quiz.create', 'api::quiz.quiz.update', 'api::quiz.quiz.delete',
//     'api::question.question.create', 'api::question.question.update', 'api::question.question.delete',
//     'api::lesson-progress.lesson-progress.courseProgress',
//     'api::lesson-progress.lesson-progress.studentProgressForInstructor',
//     'api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne',
//   ],
//   content_manager: [
//     'api::course.course.find', 'api::course.course.findOne',
//     'api::course.course.create', 'api::course.course.update', 'api::course.course.delete',
//     'api::lesson.lesson.find', 'api::lesson.lesson.findOne',
//     'api::lesson.lesson.create', 'api::lesson.lesson.update', 'api::lesson.lesson.delete',
//     'api::quiz.quiz.find', 'api::quiz.quiz.findOne',
//     'api::quiz.quiz.create', 'api::quiz.quiz.update', 'api::quiz.quiz.delete',
//     'api::question.question.create', 'api::question.question.update', 'api::question.question.delete',
//     'api::lesson-progress.lesson-progress.courseProgress',
//     'api::lesson-progress.lesson-progress.studentProgressForInstructor',
//     'api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne',
//     'api::blog-post.blog-post.create', 'api::blog-post.blog-post.update', 'api::blog-post.blog-post.delete',
//   ],
//   admin: [
//     'api::course.course.find', 'api::course.course.findOne',
//     'api::course.course.create', 'api::course.course.update', 'api::course.course.delete',
//     'api::lesson.lesson.find', 'api::lesson.lesson.findOne',
//     'api::lesson.lesson.create', 'api::lesson.lesson.update', 'api::lesson.lesson.delete',
//     'api::quiz.quiz.find', 'api::quiz.quiz.findOne',
//     'api::quiz.quiz.create', 'api::quiz.quiz.update', 'api::quiz.quiz.delete',
//     'api::question.question.create', 'api::question.question.update', 'api::question.question.delete',
//     'api::lesson-progress.lesson-progress.courseProgress',
//     'api::lesson-progress.lesson-progress.studentProgressForInstructor',
//     'api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne',
//     'api::blog-post.blog-post.create', 'api::blog-post.blog-post.update', 'api::blog-post.blog-post.delete',
//     'api::platform.platform.listUsers', 'api::platform.platform.updateUserRole',
//     'api::platform.platform.listRoles', 'api::platform.platform.stats',
//   ],
// };

// module.exports = {
//   register(/* { strapi } */) {},

//   async bootstrap({ strapi }) {
//     await ensureApplicationRoles(strapi);
//     await setDefaultRegistrationRole(strapi);
//     await ensurePermissions(strapi);
//     await seedAdminUser(strapi);
//   },
// };

// async function ensureApplicationRoles(strapi) {
//   const roleQuery = strapi.query('plugin::users-permissions.role');
//   for (const def of ROLE_DEFINITIONS) {
//     const existing = await roleQuery.findOne({ where: { type: def.type } });
//     if (!existing) {
//       await roleQuery.create({ data: { name: def.name, description: def.description, type: def.type } });
//       strapi.log.info(`[bootstrap] Created role: ${def.name} (${def.type})`);
//     }
//   }
// }

// async function setDefaultRegistrationRole(strapi) {
//   const studentRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'student' } });
//   if (!studentRole) return;
//   const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
//   const advancedSettings = (await pluginStore.get({ key: 'advanced' })) || {};
//   await pluginStore.set({
//     key: 'advanced',
//     value: { ...advancedSettings, default_role: 'student' },
//   });
// }

// async function ensurePermissions(strapi) {
//   const permissionQuery = strapi.query('plugin::users-permissions.permission');
//   const roleQuery = strapi.query('plugin::users-permissions.role');

//   for (const [roleType, actions] of Object.entries(PERMISSIONS_MAP)) {
//     const role = await roleQuery.findOne({ where: { type: roleType } });
//     if (!role) continue;

//     for (const action of actions) {
//       const existing = await permissionQuery.findOne({ where: { action, role: role.id } });
//       if (!existing) {
//         await permissionQuery.create({ data: { action, role: role.id } });
//       }
//     }
//   }
//   strapi.log.info('[bootstrap] Permissions ensured for all roles.');
// }

// async function seedAdminUser(strapi) {
//   const adminEmail = process.env.ADMIN_EMAIL;
//   const adminPassword = process.env.ADMIN_PASSWORD;
//   const adminUsername = process.env.ADMIN_USERNAME || 'admin';

//   if (!adminEmail || !adminPassword) {
//     strapi.log.warn(
//       '[bootstrap] ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping automatic admin (application role) seed. ' +
//         'Set them in backend/.env to auto-create the first Admin account, or promote a user manually via the /api/platform/users/:id/role endpoint using DB access.'
//     );
//     return;
//   }

//   const userQuery = strapi.query('plugin::users-permissions.user');
//   const existing = await userQuery.findOne({ where: { email: adminEmail.toLowerCase() } });
//   if (existing) return;

//   const adminRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'admin' } });
//   if (!adminRole) return;

//   await strapi.entityService.create('plugin::users-permissions.user', {
//     data: {
//       username: adminUsername,
//       email: adminEmail.toLowerCase(),
//       password: adminPassword,
//       provider: 'local',
//       confirmed: true,
//       blocked: false,
//       role: adminRole.id,
//     },
//   });
//   strapi.log.info(`[bootstrap] Seeded Admin application user: ${adminEmail}`);
// }

'use strict';

const ROLE_DEFINITIONS = [
  { name: 'Admin', type: 'admin', description: 'Full control of the LMS platform.' },
  { name: 'Content Manager', type: 'content_manager', description: 'Manages the course & blog content library.' },
  { name: 'Instructor', type: 'instructor', description: 'Manages their own courses, lessons, quizzes and students.' },
  { name: 'Student', type: 'student', description: 'Enrolls in courses, learns and takes quizzes.' },
];

const COMMON_ACTIONS = ['api::auth-extra.auth-extra.me'];

const PERMISSIONS_MAP = {
  public: [
    'api::course.course.find', 'api::course.course.findOne',
    'api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne',
    'api::auth-extra.auth-extra.register',
  ],
  student: [
    ...COMMON_ACTIONS,
    'api::course.course.find', 'api::course.course.findOne',
    'api::lesson.lesson.find', 'api::lesson.lesson.findOne',
    'api::enrollment.enrollment.enroll', 'api::enrollment.enrollment.myCourses',
    'api::lesson-progress.lesson-progress.markComplete', 'api::lesson-progress.lesson-progress.courseProgress',
    'api::quiz.quiz.find', 'api::quiz.quiz.findOne',
    'api::quiz-result.quiz-result.submit', 'api::quiz-result.quiz-result.myResults',
    'api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne',
  ],
  instructor: [
    ...COMMON_ACTIONS,
    'api::course.course.find', 'api::course.course.findOne',
    'api::course.course.create', 'api::course.course.update', 'api::course.course.delete',
    'api::lesson.lesson.find', 'api::lesson.lesson.findOne',
    'api::lesson.lesson.create', 'api::lesson.lesson.update', 'api::lesson.lesson.delete',
    'api::quiz.quiz.find', 'api::quiz.quiz.findOne',
    'api::quiz.quiz.create', 'api::quiz.quiz.update', 'api::quiz.quiz.delete',
    'api::question.question.create', 'api::question.question.update', 'api::question.question.delete',
    'api::lesson-progress.lesson-progress.courseProgress',
    'api::lesson-progress.lesson-progress.studentProgressForInstructor',
    'api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne',
  ],
  content_manager: [
    ...COMMON_ACTIONS,
    'api::course.course.find', 'api::course.course.findOne',
    'api::course.course.create', 'api::course.course.update', 'api::course.course.delete',
    'api::lesson.lesson.find', 'api::lesson.lesson.findOne',
    'api::lesson.lesson.create', 'api::lesson.lesson.update', 'api::lesson.lesson.delete',
    'api::quiz.quiz.find', 'api::quiz.quiz.findOne',
    'api::quiz.quiz.create', 'api::quiz.quiz.update', 'api::quiz.quiz.delete',
    'api::question.question.create', 'api::question.question.update', 'api::question.question.delete',
    'api::lesson-progress.lesson-progress.courseProgress',
    'api::lesson-progress.lesson-progress.studentProgressForInstructor',
    'api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne',
    'api::blog-post.blog-post.create', 'api::blog-post.blog-post.update', 'api::blog-post.blog-post.delete',
  ],
  admin: [
    ...COMMON_ACTIONS,
    'api::course.course.find', 'api::course.course.findOne',
    'api::course.course.create', 'api::course.course.update', 'api::course.course.delete',
    'api::lesson.lesson.find', 'api::lesson.lesson.findOne',
    'api::lesson.lesson.create', 'api::lesson.lesson.update', 'api::lesson.lesson.delete',
    'api::quiz.quiz.find', 'api::quiz.quiz.findOne',
    'api::quiz.quiz.create', 'api::quiz.quiz.update', 'api::quiz.quiz.delete',
    'api::question.question.create', 'api::question.question.update', 'api::question.question.delete',
    'api::lesson-progress.lesson-progress.courseProgress',
    'api::lesson-progress.lesson-progress.studentProgressForInstructor',
    'api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne',
    'api::blog-post.blog-post.create', 'api::blog-post.blog-post.update', 'api::blog-post.blog-post.delete',
    'api::platform.platform.listUsers', 'api::platform.platform.updateUserRole',
    'api::platform.platform.listRoles', 'api::platform.platform.stats',
  ],
};

module.exports = {
  register(/* { strapi } */) {},

  async bootstrap({ strapi }) {
    await ensureApplicationRoles(strapi);
    await setDefaultRegistrationRole(strapi);
    await ensurePermissions(strapi);
    await seedAdminUser(strapi);
  },
};

async function ensureApplicationRoles(strapi) {
  const roleQuery = strapi.query('plugin::users-permissions.role');
  for (const def of ROLE_DEFINITIONS) {
    const existing = await roleQuery.findOne({ where: { type: def.type } });
    if (!existing) {
      await roleQuery.create({ data: { name: def.name, description: def.description, type: def.type } });
      strapi.log.info(`[bootstrap] Created role: ${def.name} (${def.type})`);
    }
  }
}

async function setDefaultRegistrationRole(strapi) {
  const studentRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'student' } });
  if (!studentRole) return;
  const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const advancedSettings = (await pluginStore.get({ key: 'advanced' })) || {};
  await pluginStore.set({
    key: 'advanced',
    value: { ...advancedSettings, default_role: 'student' },
  });
}

async function ensurePermissions(strapi) {
  const permissionQuery = strapi.query('plugin::users-permissions.permission');
  const roleQuery = strapi.query('plugin::users-permissions.role');

  for (const [roleType, actions] of Object.entries(PERMISSIONS_MAP)) {
    const role = await roleQuery.findOne({ where: { type: roleType } });
    if (!role) continue;

    for (const action of actions) {
      const existing = await permissionQuery.findOne({ where: { action, role: role.id } });
      if (!existing) {
        await permissionQuery.create({ data: { action, role: role.id } });
      }
    }
  }
  strapi.log.info('[bootstrap] Permissions ensured for all roles.');
}

async function seedAdminUser(strapi) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';

  if (!adminEmail || !adminPassword) {
    strapi.log.warn(
      '[bootstrap] ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping automatic admin (application role) seed. ' +
        'Set them in backend/.env to auto-create the first Admin account, or promote a user manually via the /api/platform/users/:id/role endpoint using DB access.'
    );
    return;
  }

  const userQuery = strapi.query('plugin::users-permissions.user');
  const existing = await userQuery.findOne({ where: { email: adminEmail.toLowerCase() } });
  if (existing) return;

  const adminRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'admin' } });
  if (!adminRole) return;

  await strapi.entityService.create('plugin::users-permissions.user', {
    data: {
      username: adminUsername,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      provider: 'local',
      confirmed: true,
      blocked: false,
      role: adminRole.id,
    },
  });
  strapi.log.info(`[bootstrap] Seeded Admin application user: ${adminEmail}`);
}