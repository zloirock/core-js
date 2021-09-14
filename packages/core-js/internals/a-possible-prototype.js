module.exports = function (it) {
  if (typeof it === 'object' || typeof it === 'function') return it;
  throw TypeError("Can't set " + String(it) + ' as a prototype');
};
