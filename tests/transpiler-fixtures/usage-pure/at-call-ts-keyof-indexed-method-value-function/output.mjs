import _at from "@core-js/pure/actual/instance/at";
// `T[keyof T]` over an interface of methods resolves to the method value type (a function),
// not each method's return type, so no array narrow applies and the array-specific at
// variant is not selected
interface T {
  a(): number[];
  b(): number[];
}
declare const v: T[keyof T];
const r = _at(v).call(v, 0);
export { r };