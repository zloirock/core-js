import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
interface Src {
  t1: string;
}
interface Other {
  t1: unknown;
  onlyInU: number[];
}
// @ts-expect-error an index into a type parameter tsc cannot key is the shape under test
type Cross<T, U> = { [K in keyof T]: U[K] };
declare const crossed: Cross<Src, Other>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
crossed.onlyInU.includes(3);