// The pure Reflect namespace binding invokes through its `apply` member exactly as the entry does,
// so the callback's parameter pairs with the argument and the constructor stays home.
import Reflect from '@core-js/pure/actual/reflect';
function pick(value) { return { value }; }
Reflect.apply(pick, null, [Array]).value.from = patched;
export const result = Array.from([1]);
