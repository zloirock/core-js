// a static callee in parentheses or behind a cast is the same static as the bare spelling, so a holder
// it only reads keeps its narrow - also on the ESTree parser, where the parentheses are a node
export function viaParenthesized() {
  const holder = { items: [1, 2] };
  (Object.keys)(holder);
  return holder.items.at(0);
}
export function viaCast() {
  const holder = { items: [1, 2], read() { return this.items.includes(1); } };
  (Object.hasOwn as any)(holder, 'items');
  return holder.read();
}
