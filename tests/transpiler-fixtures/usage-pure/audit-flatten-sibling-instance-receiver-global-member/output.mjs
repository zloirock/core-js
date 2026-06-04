import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _values from "@core-js/pure/actual/instance/values";
// A flatten declarator (`{ Array: { from } } = globalThis`) shares its declaration with a sibling
// extracting an instance method off a polyfillable-global member chain. the retained receiver gets
// its proxy-global root substituted so it can't leak bare on engines without globalThis
const values = _values(_globalThis.navigator);
const from = _Array$from;
from([1]);
console.log(values);