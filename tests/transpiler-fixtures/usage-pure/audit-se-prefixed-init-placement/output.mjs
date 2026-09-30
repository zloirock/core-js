import _Array$from from "@core-js/pure/actual/array/from";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A receiver prefix runs before nested static and instance extractions.
// Multiple leaves, sibling declarators and rest retain their source evaluation order.
const sole = _toReversedMaybeArray((effect(), _globalThis.Array.prototype));
const {
  Array: {
    from: soleStatic
  }
} = (effect(), {
  Array: {
    from: _Array$from
  }
});
effect();
const twoA = _withMaybeArray(_globalThis.Array.prototype);
const twoB = _entriesMaybeArray(_globalThis.Array.prototype);
const {
  Array: {
    prototype: {
      values: mixedLeaf
    }
  },
  Object: {
    fromEntries: mixedStatic
  }
} = (effect(), {
  Array: {
    prototype: {
      values: _valuesMaybeArray(_globalThis.Array.prototype)
    }
  },
  Object: {
    fromEntries: _Object$fromEntries
  }
});
const {
  Array: {
    prototype: {
      findLast: restLeaf
    }
  },
  ...restSiblings
} = (effect(), _globalThis);
const shared = _findIndexMaybeArray((effect(), _globalThis.Array.prototype));
const sibling = 1;
export { sole, soleStatic, twoA, twoB, mixedLeaf, mixedStatic, restLeaf, restSiblings, shared, sibling };