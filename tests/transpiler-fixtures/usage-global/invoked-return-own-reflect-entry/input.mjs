// The global method keeps its normal presence injection beside a user-installed mutation.
// A prior pass's Reflect.apply entry still pairs the returned parameter slot.
import invoke from '@core-js/pure/actual/reflect/apply';
function pick(value) { return { value }; }
invoke(pick, null, [Array]).value.from = patched;
export const result = Array.from([1]);
