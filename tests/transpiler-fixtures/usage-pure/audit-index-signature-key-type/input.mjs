// mixed `[k:number]:A; [k:string]:B` index signatures - lookup dispatches by key type:
// numeric key -> number signature, string key -> string signature. each access resolves
// to the matching signature so the polyfill choice tracks the actual element type
interface M {
  [k: number]: number;
  [k: string]: number[];
}
declare const m: M;
const a = m["x"].at(0);
const b = m[0];
export { a, b };
