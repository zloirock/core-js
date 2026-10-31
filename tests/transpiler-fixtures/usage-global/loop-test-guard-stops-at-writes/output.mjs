import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a loop test holds over the body only up to a write of the binding the use reads after, and a
// `do-while` runs its body once before its first test: both stay generic
declare function next(): string | string[];
export function rewritten(node: string | string[]) {
  while (typeof node === 'string') {
    node = next();
    node.at(0);
  }
}
export function onceBefore(item: string | string[]) {
  do {
    item.includes('a');
    item = next();
  } while (typeof item === 'string');
}