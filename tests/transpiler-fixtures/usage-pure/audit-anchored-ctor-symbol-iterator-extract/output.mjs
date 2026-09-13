import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const a = _getIteratorMethod(_globalThis.Array);
a;
const m = _getIteratorMethod(_Map);
m;
const o = _getIteratorMethod(_globalThis.Object);
const fe = _Object$fromEntries;
o;
fe(x);
const {
  Set: {
    [_Symbol$iterator]: s,
    ...ri
  }
} = _globalThis;
s;
ri;