// Repeated native siblings split the default into ordered reads.
// The constructor beside the static claim still comes from its pure import.
function read({ Array: { from }, Map: M, missing: a, missing: b } = globalThis) {
  return [from([7])[0], typeof M, a, b];
}
read();
