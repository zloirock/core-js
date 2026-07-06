// extraction statements follow the props' SOURCE order even though the symbol extraction is
// registered at a later phase than the static one (the receiver copy waits for composed
// text): a `[Symbol.iterator]` binding written before a static sibling extracts first
const [{ [Symbol.iterator]: it, of: o, ...r }] = [Array];
it;
o(1);
r;
