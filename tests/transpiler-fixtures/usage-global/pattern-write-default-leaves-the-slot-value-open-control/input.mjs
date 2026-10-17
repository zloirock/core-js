export function control() {
  let list = (function* () { yield 1; })();
  ({ a: list } = { a: [1] });
  return list.join();
}
