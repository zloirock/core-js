// a leaf read off an ARRAY slot the file wrote reaches the written constructor: usage-global injects
// for it, while pure keeps the leaf native - no binding of the slot is there to guard - over an array
// literal that held a constructor and one that held none alike
const list = [Math];
list[0] = Array;
const [{
  of: viaList
}] = list;
export const fromList = viaList(1);
const plain = [1];
plain[0] = String;
const [{
  raw: viaPlain
}] = plain;
export const fromPlain = viaPlain`x`;