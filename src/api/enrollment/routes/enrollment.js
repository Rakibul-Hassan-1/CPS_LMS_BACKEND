'use strict';
const STUDENT_ONLY = { name: 'global::has-role', config: { roles: ['student'] } };

module.exports = {
  routes: [
    { method: 'GET', path: '/enrollments/me', handler: 'enrollment.myCourses', config: { policies: ['global::is-authenticated', STUDENT_ONLY] } },
    { method: 'POST', path: '/enrollments', handler: 'enrollment.enroll', config: { policies: ['global::is-authenticated', STUDENT_ONLY] } },
  ],
};
