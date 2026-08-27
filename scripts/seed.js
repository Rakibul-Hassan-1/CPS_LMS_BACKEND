'use strict';
/**
 * Optional demo-data seeder.
 * Usage (after the server has booted at least once so roles exist):
 *   npm run seed
 *
 * Creates: one instructor, one content manager, one student,
 * one course with lessons + a quiz, an enrollment, and a published blog post.
 * Safe to re-run - skips records that already exist (matched by email/title).
 */
const Strapi = require('@strapi/strapi');

async function seed() {
  const app = await Strapi().load();
  strapi = app;

  const roleByType = async (type) => strapi.query('plugin::users-permissions.role').findOne({ where: { type } });

  async function ensureUser({ username, email, password, roleType }) {
    let user = await strapi.query('plugin::users-permissions.user').findOne({ where: { email } });
    if (user) return user;
    const role = await roleByType(roleType);
    user = await strapi.entityService.create('plugin::users-permissions.user', {
      data: { username, email, password, provider: 'local', confirmed: true, blocked: false, role: role.id },
    });
    console.log(`Created ${roleType} user: ${email} / ${password}`);
    return user;
  }

  const instructor = await ensureUser({ username: 'instructor1', email: 'instructor@lms.local', password: 'Instructor@123', roleType: 'instructor' });
  await ensureUser({ username: 'contentmanager1', email: 'contentmanager@lms.local', password: 'Content@123', roleType: 'content_manager' });
  const student = await ensureUser({ username: 'student1', email: 'student@lms.local', password: 'Student@123', roleType: 'student' });

  let course = await strapi.query('api::course.course').findOne({ where: { title: 'Introduction to Web Development' } });
  if (!course) {
    course = await strapi.entityService.create('api::course.course', {
      data: {
        title: 'Introduction to Web Development',
        description: 'Learn the fundamentals of HTML, CSS and JavaScript.',
        owner: instructor.id,
      },
    });
    console.log('Created demo course');

    const lesson1 = await strapi.entityService.create('api::lesson.lesson', {
      data: { title: 'What is HTML?', contentType: 'text', content: 'HTML is the standard markup language for documents designed to be displayed in a web browser.', order: 1, course: course.id },
    });
    await strapi.entityService.create('api::lesson.lesson', {
      data: { title: 'CSS Basics', contentType: 'text', content: 'CSS describes how HTML elements are to be displayed on screen.', order: 2, course: course.id },
    });
    await strapi.entityService.create('api::lesson.lesson', {
      data: { title: 'JavaScript Fundamentals (video)', contentType: 'video', videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', order: 3, course: course.id },
    });

    const quiz = await strapi.entityService.create('api::quiz.quiz', {
      data: { title: 'Web Dev Basics Quiz', course: course.id },
    });
    await strapi.entityService.create('api::question.question', {
      data: { text: 'What does HTML stand for?', options: ['Hyper Trainer Marking Language', 'Hyper Text Markup Language', 'Hyperlinks and Text Markup Language'], correctIndex: 1, quiz: quiz.id },
    });
    await strapi.entityService.create('api::question.question', {
      data: { text: 'Which language is used to style a web page?', options: ['HTML', 'CSS', 'JSON'], correctIndex: 1, quiz: quiz.id },
    });

    await strapi.entityService.create('api::enrollment.enrollment', {
      data: { student: student.id, course: course.id, enrolledAt: new Date() },
    });

    await strapi.entityService.create('api::lesson-progress.lesson-progress', {
      data: { student: student.id, lesson: lesson1.id, course: course.id, completed: true, completedAt: new Date() },
    });
  }

  const post = await strapi.query('api::blog-post.blog-post').findOne({ where: { title: 'Welcome to our LMS' } });
  if (!post) {
    await strapi.entityService.create('api::blog-post.blog-post', {
      data: {
        title: 'Welcome to our LMS',
        body: 'We are excited to launch our new Learning Management System. Browse the courses and start learning today!',
        status: 'published',
        publishedDate: new Date(),
      },
    });
    console.log('Created demo blog post');
  }

  console.log('\nSeed complete. Demo logins:');
  console.log('  Admin        -> use ADMIN_EMAIL / ADMIN_PASSWORD from your .env');
  console.log('  Instructor   -> instructor@lms.local / Instructor@123');
  console.log('  ContentMgr   -> contentmanager@lms.local / Content@123');
  console.log('  Student      -> student@lms.local / Student@123');

  await app.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
