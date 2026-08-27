"use strict";
const { errors } = require("@strapi/utils");
const { PolicyError } = errors;

module.exports = (policyContext, config, { strapi }) => {
  if (policyContext.state.user) {
    return true;
  }
  throw new PolicyError("You must be logged in to do this.", {
    policy: "is-authenticated",
  });
};
