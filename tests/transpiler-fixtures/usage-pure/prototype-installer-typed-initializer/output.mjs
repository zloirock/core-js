import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _Map from "@core-js/pure/actual/map/constructor";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// a binding its declarator's initializer types - a constructed instance, an array literal - that later
// gets a dispatching prototype, by the installer or by `__proto__`, dispatches the installed family
// instead; one with no install keeps its type, and so does a primitive, which the installer hands back
// as itself. `Map` loads its own modules
const constructed = new _Map();
Object.setPrototypeOf(constructed, Array.prototype);
export const a = _atMaybeArray(constructed).call(constructed, -1);
const written = new _Map();
written.__proto__ = Array.prototype;
export const b = _findLastMaybeArray(written).call(written, f);
const listed = [1];
Object.setPrototypeOf(listed, String.prototype);
export const d = _includesMaybeString(listed).call(listed, '1');
const plain = new _Map();
export const e = plain.toSorted();
const text = 'ab';
Object.setPrototypeOf(text, Array.prototype);
export const g = _padStartMaybeString(text).call(text, 4);