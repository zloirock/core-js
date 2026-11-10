import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// A resolved invocation supplies the receiver; its effects and unresolved reads run once.
export const effects = [];
export const r = (() => {
  function make() {
    effects.push("make");
    return Array;
  }
  return (({
    from,
    length
  }) => [from([6])[0], length])(make`tag`);
})();