import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// a nested-block `var` holding an object whose property is a global, dereferenced through a nested
// destructure. the static-receiver walk threads the use path into the binding lookup so the
// synthetic var-hoist binding surfaces, `Arr` resolves to the global, and `from` injects its polyfill
function f(c) {
  if (c) {
    var w = {
      Arr: Array
    };
  }
  const {
    Arr: {
      from
    }
  } = w;
  from([1]);
}
f(true);