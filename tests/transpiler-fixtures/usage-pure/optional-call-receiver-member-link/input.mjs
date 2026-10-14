// an optional method call whose receiver carries a live `?.` short-circuits at that link alone: the
// guard tests the link's object and the method is read off the receiver plainly past it, so a receiver
// that comes out nullish below the link throws at the method read, as the source does. a `?.` on the
// method member itself tests the receiver's own value instead
const box = globalThis.box;
const key = 'list';
export const optionalOuter = box?.list.flatMap?.(x => [x]).toSorted?.();
export const plainOuter = box?.list.flat?.().at(0);
export const optionalResult = box?.list.findLast?.(Boolean)?.toFixed(1);
export const getTail = box?.list.toReversed?.().with;
export const computedLink = box?.[key].findLastIndex?.(Boolean).toExponential(1);
export const deeperLink = box?.inner?.list.toSpliced?.(0, 1).includes(1);
// NEGATIVE: the method member's own `?.` tests the receiver value
export const ownOptional = box?.list?.fill?.(0).keys();
