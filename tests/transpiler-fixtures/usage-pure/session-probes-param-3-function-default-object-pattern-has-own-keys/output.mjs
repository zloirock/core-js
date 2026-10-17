import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$keys from "@core-js/pure/actual/object/keys";
{
  function g({
    a: {
      hasOwn
    },
    b: {
      keys
    }
  } = {
    a: {
      hasOwn: _Object$hasOwn
    },
    b: {
      keys: _Object$keys
    }
  }) {
    return [hasOwn, keys];
  }
}