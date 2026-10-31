import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// An unknown computed key keeps its source read native.
// Global usage loads the possible own statics; prototype methods need their own usage.
// A guarded claim at the pattern's edge may still detach ahead of it.
let M = pickConstructor();
if (!M) M = Array;
const {
  from,
  [runtimeKey]: method = fallback()
} = M;
export { from, method };