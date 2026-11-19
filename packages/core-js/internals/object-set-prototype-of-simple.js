'use strict';
// helper for simple cases where we sure in passed arguments
// eslint-disable-next-line es/no-object-setprototypeof -- safe
module.exports = Object.setPrototypeOf || function (O, proto) {
  // eslint-disable-next-line no-proto -- safe
  O.__proto__ = proto;
  return O;
};
