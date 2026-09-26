// the level under the key has to BE the array literal the pattern pairs with: an object with a
// numeric key (the pattern iterates it), a level repositioned or truncated after the literal, and a
// written slot keep the source native, which throws or reads the replacement there. one static per row
const keyedObject = { k: { 0: Math } };
const { k: [{ expm1: notIterable }] } = keyedObject;
use(notIterable);
const shifted = { k: [Math] };
shifted.k.unshift(other);
const { k: [{ log1p: afterShift }] } = shifted;
use(afterShift);
const truncated = [Math];
truncated.length = 0;
const [{ fround: afterTruncate }] = truncated;
use(afterTruncate);
const written = { k: [Math] };
written.k[0] = other;
const { k: [{ clz32: afterWrite }] } = written;
use(afterWrite);
