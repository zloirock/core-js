import "core-js/modules/es.reflect.set-prototype-of";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
const rows = [7];
Object.preventExtensions(rows);
const changed = Reflect.setPrototypeOf(rows, String.prototype);
export const result = [changed, rows.at(0), "flat" in Object.setPrototypeOf([], null)];