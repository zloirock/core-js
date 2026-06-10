import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// an UNPOLYFILLED plain key beside a polyfilled one in a per-branch synth: each branch literal
// carries the polyfill for the resolvable key and re-reads the unresolvable one through THAT
// branch's receiver - the runtime picks the branch, both keys stay branch-consistent
let cond = true;
const r = (({
  from,
  custom
} = cond ? {
  from: _Array$from,
  custom: Array.custom
} : {
  from: _Iterator$from,
  custom: _Iterator.custom
}) => [from([1]), custom])();