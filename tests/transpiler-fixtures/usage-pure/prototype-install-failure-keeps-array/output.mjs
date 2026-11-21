import _at from "@core-js/pure/actual/instance/at";
import _Reflect$setPrototypeOf from "@core-js/pure/actual/reflect/set-prototype-of";
const rows = [7];
Object.preventExtensions(rows);
const changed = _Reflect$setPrototypeOf(rows, String.prototype);
export const result = [changed, _at(rows).call(rows, 0), "flat" in Object.setPrototypeOf([], null)];