// LITERAL-discriminated overloads on the remaining literal spellings: a bigint LITERAL param
// (`k: 1n`) discriminates like a string/number literal - babel's BigIntLiteral and oxc's bigint
// Literal canonicalize to one BigInt value, so both emitters pick the same arm (a dropped bigint
// value left babel on the generic fold while oxc picked the arm - a parser desync); a NEGATIVE
// literal param (`k: -1`, a UnaryExpression around the magnitude) resolves through the same
// canonical extractor on both parsers
interface P {
  get(k: 1n): string[];
  get(k: 2n): string;
}
interface Q {
  pick(k: -1): string[];
  pick(k: 1): string;
}
declare const p: P;
declare const q: Q;
p.get(1n).at(0);
p.get(2n).at(0);
q.pick(-1).includes('z');
q.pick(1).at(0);
