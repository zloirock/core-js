import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  return function ({
    from
  } = (effects.push("default"), Array)) {
    return [from([5])[0], arguments[0] === undefined];
  }();
})();