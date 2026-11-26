import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
declare namespace NS {
  function q(x: number): number[] | string;
  function q(x: string): string;
}
declare const f: typeof NS.q;
export const viaQualified = f(5).at(0);