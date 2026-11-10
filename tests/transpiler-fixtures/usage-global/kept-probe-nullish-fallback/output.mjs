import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A nullish selection keeps a nullable stored left and the fallback arm.
let held, from;
({
  from
} = (held = globalThis.window)?.Array ?? {});
use(from, held);