import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// `typeof container.field` may read the initialiser only while nothing reassigns the container -
// otherwise the first init no longer describes the runtime value.
let container = {
  field: [1, 2, 3]
};
container = {
  field: "text"
} as any;
const frozen = {
  slot: [1, 2, 3]
};
declare const reassigned: typeof container.field;
declare const kept: typeof frozen.slot;
_at(reassigned).call(reassigned, 0);
_includesMaybeArray(kept).call(kept, 1);