var aCallable = require('../internals/a-callable');

module.exports = function (obj) {
  return {
    iterator: obj,
    next: aCallable(obj.next)
  };
};
