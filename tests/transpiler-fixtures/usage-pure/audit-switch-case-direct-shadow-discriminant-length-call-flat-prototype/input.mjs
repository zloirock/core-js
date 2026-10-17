// A case-level lexical binding covers the case block, not the discriminant. The discriminant still reads the outer realm or
// constructor alias.
let y1 = {};
switch (globalThis.self.Array.prototype.flat.call([1, [2]]).length) {
  case 1:
    let globalThis = y1;
    break;
}
export { y1 };
