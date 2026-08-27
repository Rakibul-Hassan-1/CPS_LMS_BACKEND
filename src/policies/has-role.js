"use strict";
const { errors } = require("@strapi/utils");
const { PolicyError } = errors;
const { resolveUserRole } = require("../utils/permissions");

/**
 * Usage in routes:
 * config: { policies: [{ name: 'global::has-role', config: { roles: ['admin', 'instructor'] } }] }
 */
module.exports = async (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;
  if (!user) {
    throw new PolicyError("You must be logged in to do this.", {
      policy: "has-role",
    });
  }
  const roles = (config && config.roles) || [];
  const roleType = await resolveUserRole(strapi, user);
  strapi.log.info(
    `[has-role DEBUG] user=${
      user.id
    } resolvedRoleType="${roleType}" allowedRoles=${JSON.stringify(roles)}`,
  );
  if (roles.includes(roleType)) {
    return true;
  }
  throw new PolicyError(
    `Your role (${roleType}) is not allowed to perform this action.`,
    {
      policy: "has-role",
    },
  );
};
