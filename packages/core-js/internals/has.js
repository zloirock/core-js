var hasOwnProperty = {}.hasOwnProperty;

module.exports = function hasOwn(it, key) {
  return hasOwnProperty.call(it, key);
};
