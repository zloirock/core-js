// A symbol-keyed leaf beside rest keeps its native iterator read and rest exclusions.
// The neighbouring of read also remains native; Symbol.iterator itself is served.
const [{ [Symbol.iterator]: it, of: o, ...r }] = [Array];
it;
o(1);
r;
