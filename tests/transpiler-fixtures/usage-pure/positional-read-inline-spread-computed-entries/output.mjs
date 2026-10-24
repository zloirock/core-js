import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _entries from "@core-js/pure/actual/instance/entries";
var _ref;
// A binding spread lets every following slot escape into the mutated alias.
const box = [[1]];
const [viaCensusShifted] = [...wrapped, box];
_pushMaybeArray(viaCensusShifted).call(viaCensusShifted, 's');
_entries(_ref = box[0]).call(_ref);
export { viaCensusShifted };