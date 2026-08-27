'use strict';
const STUDENT_ONLY = { name: 'global::has-role', config: { roles: ['student'] } };
const PRIVILEGED = { name: 'global::has-role', config: { roles: ['admin', 'content_manager', 'instructor'] } };

module.exports = {
  routes: [
    { method: 'POST', path: '/lesson-progress/complete', handler: 'lesson-progress.markComplete', config: { policies: ['global::is-authenticated', STUDENT_ONLY] } },
    { method: 'GET', path: '/lesson-progress/course/:courseId', handler: 'lesson-progress.courseProgress', config: { policies: ['global::is-authenticated'] } },
    { method: 'GET', path: '/lesson-progress/student/:studentId/course/:courseId', handler: 'lesson-progress.studentProgressForInstructor', config: { policies: ['global::is-authenticated', PRIVILEGED] } },
  ],
};
