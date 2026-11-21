import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Handing out each element preserves the value in the outer slot.
const looped = [[1], [2]];
for (const el of looped) use(el);
export const viaForOfEscape = _atMaybeArray(_ref = looped[0]).call(_ref, 9);