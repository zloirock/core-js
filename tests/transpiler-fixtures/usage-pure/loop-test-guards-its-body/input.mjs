// a `while` or `for` runs its body only while its test holds and asks the test again before every
// run, so the test narrows the body as an `if` narrows its consequent - a write after the use, or in
// the update, is followed by that re-test; the negated test narrows to the other arm
declare function next(): string | string[];
export function firsts(node: string | string[]) {
  while (typeof node === 'string') {
    node.at(0);
    node = next();
  }
}
export function scan(item: string | string[]) {
  for (; typeof item === 'string'; item = next()) item.includes('a');
}
export function arrays(list: string | string[]) {
  while (typeof list !== 'string') {
    list.find(Boolean);
    list = next();
  }
}
