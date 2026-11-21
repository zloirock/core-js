const rows = [7];
Object.preventExtensions(rows);
const changed = Reflect.setPrototypeOf(rows, String.prototype);
export const result = [changed, rows.at(0), "flat" in Object.setPrototypeOf([], null)];
