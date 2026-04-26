import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// destructuring with TS-cast init `const { x } = obj as any`: the cast peels away
// and the destructure receivers route through the polyfill rewrites normally.
const {
  from
} = Array as any;
const {
  resolve
} = Promise satisfies any;