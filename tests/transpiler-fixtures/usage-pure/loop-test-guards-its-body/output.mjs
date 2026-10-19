import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a `while` or `for` runs its body only while its test holds and asks the test again before every
// run, so the test narrows the body as an `if` narrows its consequent - a write after the use, or in
// the update, is followed by that re-test; the negated test narrows to the other arm
declare function next(): string | string[];
export function firsts(node: string | string[]) {
  while (typeof node === 'string') {
    _atMaybeString(node).call(node, 0);
    node = next();
  }
}
export function scan(item: string | string[]) {
  for (; typeof item === 'string'; item = next()) _includesMaybeString(item).call(item, 'a');
}
export function arrays(list: string | string[]) {
  while (typeof list !== 'string') {
    _findMaybeArray(list).call(list, Boolean);
    list = next();
  }
}