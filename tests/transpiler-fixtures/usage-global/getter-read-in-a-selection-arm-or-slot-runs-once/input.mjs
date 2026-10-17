// a getter read (`K.g`) in a sequence prefix of a realm SELECTION arm, or in a literal SLOT the
// destructure discards, is work the source does: it runs once where the source ran it, and a read
// the claim's own dispatch performs (a carried slot, an element) is not replayed beside it
class K { static get g() { log(); return 0; } }
const nb = { get y() { log(); return [1, 2]; }, get z() { log(); return 1; } };
const { Array: { from: a1 } } = (K.g, globalThis) ?? {};
const { Iterator: { from: a2 } } = (K.g, globalThis) || {};
const { Promise: { try: a3 } } = c ? (K.g, globalThis) : {};
const { y: { at: v4 } } = { y: nb.y, z: nb.z };
const [{ y: { flat: v5 } }] = [{ y: nb.y }];
const [{ [Symbol.iterator]: it6 }] = [nb.y];
use(a1, a2, a3, v4, v5, it6);
