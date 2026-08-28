const src2 = [1, [2]];
let at, includes;
({ at, includes } = [1, 2, 3]);
// a REST sibling is a residual like any other: it re-reads the receiver past the renamed key, so
// the memo is what gives both readers one identity - the arrangement the DECLARATION host emits for
// the same pattern, and the one a receiver nothing can re-read has no other way to get
let at2, rest2;
({ at: at2, ...rest2 } = [1, 2]);
// ... and a receiver whose evaluation is OBSERVABLE takes it for the same reason, once
let at3, rest3;
({ at: at3, ...rest3 } = mk());
// a re-readable receiver needs none of it: both readers spell the binding
let at4, rest4;
const src = [1, 2];
({ at: at4, ...rest4 } = src);
export { at, includes, at2, rest2, at3, rest3, at4, rest4 };
// a claim INSIDE the receiver keeps its own step: the consume spells that receiver, and a copy
// taken when the job registered carries the source read with its polyfill lost - the spelling is
// read LIVE instead. the memo route already did, its `_ref` being built from the rewritten init
const other = [3, [4]];
let inner;
({ at: inner } = other.flat());
// ... and so does a claim inside the slot DEFAULT, read through the slot at render time
let viaDefault;
({ at: { name: viaDefault } = other.flat() } = src2);
export { inner, viaDefault };
