var hide = require('../internals/hide');

module.exports = function (target, key, value, options) {
  if (options && options.enumerable) target[key] = value;
  else hide(target, key, value);
};
