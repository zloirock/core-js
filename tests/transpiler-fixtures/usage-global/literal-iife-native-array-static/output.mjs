import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A literal IIFE keeps the same native static boundary as a direct wrapper.
// Array has no substituted constructor and its method stays native in pure mode.
const {
  C: {
    from
  }
} = (() => ({
  C: Array
}))();
export const r = typeof from;