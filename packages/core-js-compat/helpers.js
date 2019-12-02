'use strict';
const { coerce: semver, cmp } = require('semver');
const data = require('./data');

const modules = Object.keys(data);

function compare(a, operator, b) {
  return cmp(semver(a), operator, semver(b));
}

function normalizeModulesList(list, order) {
  const set = new Set(list);
  return (Array.isArray(order) ? order : modules).filter(name => set.has(name));
}

module.exports = {
  compare,
  normalizeModulesList,
  semver,
};
