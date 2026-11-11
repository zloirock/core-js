import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// An immediately invoked pattern reads the same mirrored fallback as a parameter.
export const result = (({
  w: {
    Array: {
      from
    }
  } = choose() ? globalThis : {}
}) => from([7]))({});