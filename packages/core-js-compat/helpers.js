'use strict';
const cmp = require('semver/functions/cmp');
const semver = require('semver/functions/coerce');

const has = Function.call.bind({}.hasOwnProperty);

function compare(a, operator, b) {
  return cmp(semver(a), operator, semver(b));
}

function intersection(list, order) {
  const set = list instanceof Set ? list : new Set(list);
  return order.filter(name => set.has(name));
}

module.exports = {
  compare,
  has,
  intersection,
  semver,
};
