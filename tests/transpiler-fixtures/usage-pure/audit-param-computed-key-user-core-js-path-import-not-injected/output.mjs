// An imported key prevents a parameter mirror regardless of its source path.
// The exported function retains the native pattern, including the named static.
import KEY from 'a-core-js-helper';
export function pick({
  [KEY]: own,
  of
} = Array) {
  return [own, of([1])];
}