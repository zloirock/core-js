import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A prefix does not make an effectful realm key eligible for pure collapse.
export const {
  Array: {
    from
  }
} = (prefix(), globalThis)[key(), 'window'];