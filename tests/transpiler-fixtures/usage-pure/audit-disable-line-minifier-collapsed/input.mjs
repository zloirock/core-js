// a disable-next-line over a minifier-collapsed statement covers EVERY split product: the
// directive is read off the statement as written, and each product keeps its operand's own
// position on that covered line
let from;
// core-js-disable-next-line
(eff(), ({ from } = Array));
export const r1 = from;
let of2;
(eff2(), ({ of: of2 } = Array));
export const r2 = of2(1);
