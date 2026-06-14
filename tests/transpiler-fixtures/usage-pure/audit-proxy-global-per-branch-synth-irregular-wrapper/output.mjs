import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// per-branch destructure synth where one branch is a proxy-global receiver behind an irregular
// wrapper (a sequence wrapping a partial member chain, `((e(), globalThis).self).Array`). the
// per-branch synth marks that receiver skipped, so the proxy-global root must still be substituted
// to `_globalThis` when its byte range is rebuilt - leaving it raw would strand a global the skipped
// visitor no longer covers. the side-effecting `e()` prefix stays ahead of the substituted root
let c = true,
  e = () => 0;
const {
  from
} = c ? {
  from: _Array$from
} : ((e(), _globalThis).self.Array, {
  from: _Array$from
});
from([1]);