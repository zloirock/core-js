import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a `[Symbol.iterator]` prop whose plan-consumed extraction is the declarator's ONLY one
// still hands the emission to the flatten: the plan's existence makes the rebuild fireable
// from ANY sibling's dispatch (here non-consuming nested siblings - a missing-able ctor
// pattern and an unknown key), so a per-prop route would race it and crash the composition
const it = _getIteratorMethod(_globalThis);
const {
  [_Symbol$iterator]: _unused,
  Map: {
    custom
  },
  ...r
} = _globalThis;
it;
custom;
r;
const it2 = _getIteratorMethod(_globalThis);
const {
  [_Symbol$iterator]: _unused2,
  Foo: {
    bar
  },
  ...r2
} = _globalThis;
it2;
bar;
r2;