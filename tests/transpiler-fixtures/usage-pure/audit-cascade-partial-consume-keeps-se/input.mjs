// assignment-cascade PARTIAL consume (a rest / non-consumed sibling keeps the residual): the
// init's side-effecting sequence prefix must survive in the rebuilt residual - only a FULL
// consume may discard the rebuilt init
let effectRan = false, rest;
let from;
(({ Array: { from }, ...rest } = (effectRan = true, globalThis).self));
let counted = 0, keep;
let of;
(({ Array: { of }, keep } = (counted++, globalThis).self));
export const r = [from, of, rest, keep, effectRan, counted];
