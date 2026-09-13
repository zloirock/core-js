import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A call carried into a rebuilt realm-navigation guard keeps the claims inside its arguments.
// The tail uses a different method so the argument's import is independently observable.
const realm = () => globalThis;
const values = [1, 2, 3];
export const result = realm(values.at(0)).window.window.self?.Array.of(9).includes(9);