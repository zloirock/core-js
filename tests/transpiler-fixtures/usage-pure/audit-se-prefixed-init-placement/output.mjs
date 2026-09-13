import _Array$from from "@core-js/pure/actual/array/from";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const sole = _toReversedMaybeArray((effect(), _globalThis.Array.prototype));
effect();
const soleStatic = _Array$from;
effect();
const twoA = _withMaybeArray(_globalThis.Array.prototype);
const twoB = _entriesMaybeArray(_globalThis.Array.prototype);
const _ref = (effect(), _globalThis);
const mixedLeaf = _valuesMaybeArray(_globalThis.Array.prototype);
const mixedStatic = _Object$fromEntries;
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