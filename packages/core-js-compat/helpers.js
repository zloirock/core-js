'use strict';
const data = require('./data');

const modules = Object.keys(data);

function normalizeModulesList(list, order) {
  const set = new Set(list);
  return (Array.isArray(order) ? order : modules).filter(name => set.has(name));
}

module.exports = {
  normalizeModulesList,
};
