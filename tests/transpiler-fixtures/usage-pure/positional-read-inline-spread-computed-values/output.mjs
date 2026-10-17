import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _values from "@core-js/pure/actual/instance/values";
var _ref;
// An inline spread preserves the alias through which a mutation reaches the selected element.
const box = [[1]];
const [viaCensus] = [...[box]];
_pushMaybeArray(viaCensus).call(viaCensus, 's');
_values(_ref = box[0]).call(_ref);
export { viaCensus };