// An inline object argument and its named equivalent have the same escape behavior. Inspection preserves fields; mutation, handing
// slots out or retaining an identity result widens them.
export function namedHolderAtInspectedSlot() {
  const held = {
    rows: [1, 2],
    read() {
      return this.rows.at(0);
    }
  };
  return Object.keys(held);
}
