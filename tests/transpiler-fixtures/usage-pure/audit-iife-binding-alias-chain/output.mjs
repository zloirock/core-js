import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// inline-call resolution walks at most ONE binding-hop. covers four shapes:
//   1) `const f = g; const g = () => Map; f()` - two hops, must NOT inline
//   2) `const h = () => Promise; h()` - one hop with pure body, inlines and rewrites
//   3) block body with prefix statement (`calls++; return Promise`) - inlines but the
//      receiver call must remain observable so the side effect runs
//   4) sequence-expression body `(calls++, Promise)` - bails to keep side effect via
//      the original call (safe miss preferred over unsafe SE-tail unwrap)
const g = () => _Map;
const f = g;
const out1 = f().has(1);
const h = () => _Promise;
const out2 = _Promise$resolve(2);
let calls = 0;
const k = () => {
  calls++;
  return _Promise;
};
const out3 = (k(), _Promise$resolve)(3);
const m = () => (calls++, _Promise);
const out4 = m().reject(4);
export { out1, out2, out3, out4, calls };