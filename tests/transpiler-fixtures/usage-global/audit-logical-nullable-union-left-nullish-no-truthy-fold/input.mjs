// `r: number[] | null` union fold strips the null arm, but the runtime value may still be
// nullish, so `??` may yield the RIGHT operand: the always-truthy fold must not collapse to
// the left's shape - usage-global injects the union of both operand shapes (es.array.at +
// es.string.at), not the Array-only set. single scenario per fixture: file-wide import dedup
// would let another line injecting es.string.at mask a fold regression of this one
declare const r: number[] | null;
(r ?? 'fallback').at(0);
