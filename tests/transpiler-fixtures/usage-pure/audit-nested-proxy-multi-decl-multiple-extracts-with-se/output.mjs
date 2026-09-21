import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Nested statics and plain declarators retain source order.
// The second static initializer keeps its prefix between the surrounding siblings.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  before = trackBefore(),
  {
    Object: {
      keys
    }
  } = (log('SE'), {
    Object: {
      keys: _Object$keys
    }
  }),
  after = trackAfter();
export { from, before, keys, after };