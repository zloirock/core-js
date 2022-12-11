var getBuiltIn = require('../internals/get-built-in');

var createEmptySetLike = function () {
  return {
    size: 0,
    has: function () {
      return false;
    },
    keys: function () {
      return {
        next: function () {
          return { done: true };
        }
      };
    }
  };
};

module.exports = function (name) {
  try {
    var Set = getBuiltIn('Set');
    new Set()[name](createEmptySetLike());
    return true;
  } catch (error) {
    return false;
  }
};
