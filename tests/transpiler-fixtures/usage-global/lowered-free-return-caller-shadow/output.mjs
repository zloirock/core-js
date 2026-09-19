import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A lowered block function may be initialized: writes through successful calls still taint its free return.
try {
  var pick = function () {
    return Array;
  };
  var install = function (Array) {
    pick.call(null).from = patched;
  };
  install({});
} finally {}
export const result = Array.from([1]);