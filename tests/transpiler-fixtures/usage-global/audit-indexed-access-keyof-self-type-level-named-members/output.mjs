import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// `T[keyof T]` written as a type over a constraint whose named members share a family: a subtype may
// still add a key of another family, so the read stays generic, as tsc leaves it - the plain index
// and a `K extends keyof T` one alike
export function first<T extends {
  a: number[];
  b: number[];
}>(value: T[keyof T]) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return value.at(0);
}
export function has<T extends {
  a: string;
  b: string;
}, K extends keyof T>(value: T[K]) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return value.includes('a');
}