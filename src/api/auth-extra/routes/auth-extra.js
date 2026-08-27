// 'use strict';
// module.exports = {
//   routes: [
//     { method: 'POST', path: '/auth-extra/register', handler: 'auth-extra.register', config: { policies: [], auth: false } },
//   ],
// };


'use strict';
module.exports = {
  routes: [
    { method: 'POST', path: '/auth-extra/register', handler: 'auth-extra.register', config: { policies: [], auth: false } },
    { method: 'GET', path: '/auth-extra/me', handler: 'auth-extra.me', config: { policies: ['global::is-authenticated'] } },
  ],
};