// Pattern pairing follows aliases to their container literal. Its write gate must follow
// the same owner: replacing box.item invalidates the value captured through alias.
export function read() {
  const box = { item: Array };
  const alias = box;
  box.item = { from() { return [9]; } };
  const { item } = alias;
  return item.from([1]);
}
