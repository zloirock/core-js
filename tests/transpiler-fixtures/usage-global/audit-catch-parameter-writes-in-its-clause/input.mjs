// a catch parameter is scoped to its own clause: the outer binding's writes are not its writes and
// its body's writes are, so the write scan anchors at the clause and a typeof guard inside it
// narrows the parameter - the outer `data` was reassigned, the inner one never
export function h(risky) {
  let data = [1, 2, 3];
  data = 'fallback';
  try {
    risky();
  } catch (data) {
    if (typeof data === 'string') return data.at(0);
  }
  return data;
}
