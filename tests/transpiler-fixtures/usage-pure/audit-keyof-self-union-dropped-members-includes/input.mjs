interface Loose {
  ys: string[];
  blah;
}
declare const w: Loose[keyof Loose];
export const r2 = w.includes("q");
