import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
interface Loose {
  ys: string[];
  blah;
}
declare const w: Loose[keyof Loose];
export const r2 = w.includes("q");