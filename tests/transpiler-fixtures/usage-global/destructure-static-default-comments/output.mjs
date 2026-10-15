import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// Global injection preserves the original static default and its comments.
// Comments on a removed default must not annotate the surviving receiver prefix.

const {
  Array: {
    of = /* removed default */fallback(/*#__PURE__*/make())
  }
} = (/* receiver prefix */touch(), this);
const {
  Array: {
    from = /* removed optional default */fallback(/*#__PURE__*/make())
  }
} = (/* optional receiver prefix */touch?.(), this);
const {
  Object: {
    hasOwn = /*#__PURE__*/factory()
  }
} = (/* leading default receiver */touchLeading(), this);
export { of, from, hasOwn };