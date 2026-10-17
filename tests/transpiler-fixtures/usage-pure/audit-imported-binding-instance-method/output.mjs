import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// imported binding called as instance method: `import { items }` then `items.flat()`.
// without a known type, the call must fall back to generic instance dispatch
import { items } from './data';
var _ref;
const result = _flatMaybeArray(_ref = items).call(_ref);