import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
declare namespace NS {
  function q(x: number): number[];
  function q(x: string): string;
}
declare const f: typeof NS.q;
export const viaQualified = f(5).findLast(v => v > 0);
f(5).at(0);