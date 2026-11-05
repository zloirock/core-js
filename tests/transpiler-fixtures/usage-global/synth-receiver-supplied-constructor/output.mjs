import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A supplied global constructor is read independently of the shadowed parameter default.
(({
  from
} = Array, Array) => from([1, 2]))(globalThis.Array);