import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// inline-array spread args expand positionally for the per-branch synth: the receiver
// param maps through ...[...] exactly like plain args (raw arguments indexing bailed the
// branch synth and left the native static unpolyfilled); a dynamic spread stays undecidable
let c = true;
const r = ((x, {
  from
}) => from)(...[1, c ? {
  from: _Array$from
} : {
  from: _Iterator$from
}]);
r([2]);