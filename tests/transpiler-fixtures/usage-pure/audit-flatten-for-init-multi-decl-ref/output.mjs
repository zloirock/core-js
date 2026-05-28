import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
// for-init multi-declarator flatten: the destructure declarator is fully consumed and
// rewritten into a synthesized `_unused = (sePrefix, tail)` sink while a sibling `idx`
// declarator keeps its own init. The SE-prefix arrow needs a `var _ref;` binding for
// `[].values()`; that binding belongs to the synth declarator only. If the binding
// leaks into the sibling, the for-init emits a duplicate or misplaced `_ref` and the
// loop fails at runtime. Distinct methods on each side keep both branches observable.
for (let idx = 0, from = _Array$from, _unused = ((() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })(), _globalThis); idx < 1; idx++) from([idx]);