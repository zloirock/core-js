import _Array$from from "@core-js/pure/actual/array/from";
// per-branch destructure synth where one branch is a proxy-global receiver behind an irregular wrapper
// (a sequence wrapping a partial member chain, `((e(), globalThis).self).Array`). the synth discards
// the receiver value, and re-emitting the MULTI-hop chain would read an undefined `.self` intermediate
// hop off-browser (ie:11 / Node). so the receiver is DROPPED - only its side-effecting `e()` prefix
// survives, ahead of the synth literal. both emitters drop the discarded receiver identically
let c = true,
  e = () => 0;
const {
  from
} = c ? {
  from: _Array$from
} : (e(), {
  from: _Array$from
});
from([1]);