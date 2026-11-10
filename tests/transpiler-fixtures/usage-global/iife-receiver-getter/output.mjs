import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  const user = {
    get from() {
      effects.push("get");
      return () => 11;
    }
  };
  return function ({
    from
  } = Array) {
    return [from(), arguments[0] === user];
  }(user);
})();