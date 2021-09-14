module.exports = function (it) {
  if (typeof it === 'function') return it;
  throw TypeError(String(it) + ' is not a function');
};
