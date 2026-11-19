import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An imported type is not a built-in synonym with the same spelling.
// Its unresolved receiver uses generic instance dispatch.
import type { PromiseLike } from './types';
export function read(value: PromiseLike<number>) {
  return value.at(0);
}