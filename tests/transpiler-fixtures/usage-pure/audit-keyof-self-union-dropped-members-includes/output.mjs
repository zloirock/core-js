import _includes from "@core-js/pure/actual/instance/includes";
interface Loose {
  ys: string[];
  blah;
}
declare const w: Loose[keyof Loose];
export const r2 = _includes(w).call(w, "q");