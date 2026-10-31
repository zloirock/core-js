// a carried init read THROUGH the TS assertions a source may spell around it: `as`, `satisfies` and
// the non-null operator are ERASED at runtime, so what they hold performs exactly the effects they
// do. the two legs' parsers disagree about which of these reach the tree at all, so a predicate
// reading the RAW node answers differently about one program - the peel is what makes them one
const arr = [3, [1, 2]];
const { y: { at: viaCastInit } } = { y: arr.flat() } as any;
const { y: { at: viaCastSlot } } = { y: arr.flat() as any[] };
const { y: { at: viaNonNullInit } } = ({ y: arr.flat() })!;
const { y: { at: viaSatisfiesInit } } = ({ y: arr.flat() }) satisfies any;
const [{ y: { at: viaCastElement } }] = [{ y: arr.flat() } as any];
const [{ y: { at: viaCastWrapInit } }] = [{ y: arr.flat() }] as any;
const [{ y: { at: viaNonNullElement } }] = [({ y: arr.flat() })!];
export { viaCastInit, viaCastSlot, viaNonNullInit, viaSatisfiesInit };
export { viaCastElement, viaCastWrapInit, viaNonNullElement };
