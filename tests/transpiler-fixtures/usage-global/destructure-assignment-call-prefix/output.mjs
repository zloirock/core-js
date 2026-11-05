import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// An indirect constructor call supplies a native residual after the served static leaf.
// The source prefix runs before both bindings even though the call itself stays with the residual.
let from, x;
({
  from,
  x
} = (effect(), (() => Array)()));
use(from, x);