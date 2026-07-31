import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// inline-call resolution follows identifier binding-hops transitively. covers four shapes:
//   1) `const g = () => Map; const f = g; f()` - two hops, follows to the arrow and inlines
//   2) `const h = () => Promise; h()` - one hop with pure body, inlines and rewrites
//   3) block body with prefix statement (`calls++; return Promise`) - inlines but the
//      receiver call must remain observable so the side effect runs
//   4) sequence-expression body `(calls++, Promise)` - classifies through the sequence TAIL
//      and rewrites like the block-with-prefix shape; the original call re-emits ahead so
//      the side effect still runs exactly once
const g = () => _Map;
const f = g;
const out1 = _Map.has(1);
const h = () => _Promise;
const out2 = _Promise$resolve(2);
let calls = 0;
const k = () => {
  calls++;
  return _Promise;
};
const out3 = (k(), _Promise$resolve)(3);
const m = () => (calls++, _Promise);
const out4 = (m(), _Promise$reject)(4);
export { out1, out2, out3, out4, calls };