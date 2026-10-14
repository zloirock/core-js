// A parameter pattern's rewrite moves the default into the function body, the writes in it with it. A
// read in a nested key of the pattern still sees the default's write, also once a rewrite elsewhere in
// the file has every write record read again.
export function first() {
  let list;
  const { trunc, [(list = 'cd', 'sign')]: make } = (list = [3], Math);
  return [trunc, make, list.includes('c')];
}
export function second() {
  let text = [1, 2];
  let head;
  (function ({ from, prototype: { [head = text.at(0)]: missing } } = (text = 'ab', Array)) {
    return [from, missing];
  })();
  return head;
}
