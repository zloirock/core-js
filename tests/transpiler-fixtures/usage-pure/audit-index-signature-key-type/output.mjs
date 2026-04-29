import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// mixed `[k:number]:A; [k:string]:B` index signatures - lookup must dispatch by key type:
// numeric key -> number signature, string key -> string signature. previously first-match
// won regardless of key, and silently dropped both candidates when neither matched the
// receiver type
interface M {
  [k: number]: number;
  [k: string]: number[];
}
declare const m: M;
const a = _atMaybeArray(_ref = m["x"]).call(_ref, 0);
const b = m[0];
export { a, b };