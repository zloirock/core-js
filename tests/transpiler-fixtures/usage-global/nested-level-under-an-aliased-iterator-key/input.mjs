// A nested level under an aliased iterator key reads the iterator method, whose modules the key's own read
// already loads; both emitters load that same set, and the leaf adds no module of its own.
const it = Symbol.iterator;
const { [it]: { next } } = getList();
export { next };
