import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
interface M {
  [k: number]: string[];
}
declare const sig: M;
declare const s: string;
sig[s].includes('x');