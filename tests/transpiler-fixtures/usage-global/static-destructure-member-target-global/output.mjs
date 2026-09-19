import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Writing a global static must keep the original assignment and its property semantics.
({
  from: globalThis.Array.from
} = Array);