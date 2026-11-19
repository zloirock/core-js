import _at from "@core-js/pure/actual/instance/at";
// An imported type is not a built-in synonym with the same spelling.
// Its unresolved receiver uses generic instance dispatch.
import type { PromiseLike } from './types';
export function read(value: PromiseLike<number>) {
  return _at(value).call(value, 0);
}