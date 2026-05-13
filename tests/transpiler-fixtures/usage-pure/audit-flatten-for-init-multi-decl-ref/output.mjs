import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
// for-init multi-declarator flatten: the destructure declarator gets fully consumed and
// synthesized to `_unused = (sePrefix, tail)` while a sibling `idx` declarator keeps its
// own init. flushPendingFlatten drains scope-tracker per declarator independently and
// attaches drainedRefs to each entry; the synth declarator bakes refs into its seSrc, the
// sibling declarator stays untouched. distinct method (`Array.from` static-extract vs
// `.values` instance polyfill in the SE-prefix arrow) keeps both branches observable.
for (let idx = 0, from = _Array$from, _unused = ((() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })(), _globalThis); idx < 1; idx++) from([idx]);