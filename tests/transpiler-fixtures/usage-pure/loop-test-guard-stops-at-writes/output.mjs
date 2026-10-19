import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a loop test holds over the body only up to a write of the binding the use reads after, and a
// `do-while` runs its body once before its first test: both stay generic
declare function next(): string | string[];
export function rewritten(node: string | string[]) {
  while (typeof node === 'string') {
    node = next();
    _at(node).call(node, 0);
  }
}
export function onceBefore(item: string | string[]) {
  do {
    _includes(item).call(item, 'a');
    item = next();
  } while (typeof item === 'string');
}