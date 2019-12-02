'use strict';
const { coerce: semver, cmp } = require('semver');

function compare(a, operator, b) {
  return cmp(semver(a), operator, semver(b));
}

function intersection(list, order) {
  const set = new Set(list);
  return order.filter(name => set.has(name));
}

module.exports = {
  compare,
  intersection,
  semver,
};
