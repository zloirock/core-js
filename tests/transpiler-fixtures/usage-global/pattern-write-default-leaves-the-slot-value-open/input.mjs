// A write through a pattern slot with a default holds the default wherever the slot comes up undefined, so the value
// the source pairs with the slot does not decide the read: it stays open in an assignment, an element, a nested
// level, a `var` redeclaration and an assignment inside an initializer alike, and loads the method of every type
// that carries it. Without a default the paired value decides it.
export function paired(flag) {
  let list = [3, 4];
  ({ a: list = 'ab' } = { a: flag ? [1] : undefined });
  return list.at(-1);
}
export function undefinedSlot() {
  let list = [3, 4];
  ({ a: list = 'ab' } = { a: undefined });
  return list.includes(3);
}
export function element() {
  let list = [3, 4];
  [list = [1].values()] = [undefined];
  return list.find(x => x);
}
export function nested() {
  let list = [3, 4];
  ({ a: { b: list = [1].keys() } } = { a: { b: undefined } });
  return list.filter(x => x);
}
export function redeclared() {
  var list = [3, 4];
  var { a: list = [1].entries() } = { a: undefined };
  return list.flatMap(x => [x]);
}
export function initializer() {
  let list = [3, 4];
  const settled = (({ a: list = 'ab'[Symbol.iterator]() } = { a: undefined }), 0);
  return [settled, list.map(x => x)];
}
export function control() {
  let list = (function* () { yield 1; })();
  ({ a: list } = { a: [1] });
  return list.join();
}
