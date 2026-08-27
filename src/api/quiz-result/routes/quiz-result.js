'use strict';
const STUDENT_ONLY = { name: 'global::has-role', config: { roles: ['student'] } };

module.exports = {
  routes: [
    { method: 'POST', path: '/quiz-results/submit', handler: 'quiz-result.submit', config: { policies: ['global::is-authenticated', STUDENT_ONLY] } },
    { method: 'GET', path: '/quiz-results/me', handler: 'quiz-result.myResults', config: { policies: ['global::is-authenticated', STUDENT_ONLY] } },
  ],
};
