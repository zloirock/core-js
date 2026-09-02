// the comments around a minifier sequence are kept by its split: a comment above the statement
// leads its first product, a trailing one follows, and a comment on its own line ahead of a plain
// operand leads the product that operand becomes. a comment sharing the line with the operands
// is kept too, where it lands within that line being each printer's own; an operand the rewrite
// REBUILDS keeps none of its comments on either leg, so no comment sits on those here
const arr = [1, [2]];
let at, flat;
// leads the sequence
(eff(), ({ at } = arr), /* ahead of the tail */ use(at)); // trails the sequence
(eff2(),
  ({ flat } = arr),
  // own line ahead of the tail
  use(flat));
