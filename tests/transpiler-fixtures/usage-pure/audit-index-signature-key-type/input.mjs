// mixed `[k:number]:A; [k:string]:B` index signatures - lookup must dispatch by key type:
// numeric key -> number signature, string key -> string signature. previously first-match
// won regardless of key, and silently dropped both candidates when neither matched the
// receiver type
interface M {
  [k: number]: number;
  [k: string]: number[];
}
declare const m: M;
const a = m["x"].at(0);
const b = m[0];
export { a, b };
