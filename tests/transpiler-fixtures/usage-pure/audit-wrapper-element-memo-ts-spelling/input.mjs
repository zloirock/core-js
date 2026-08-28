// the wrapper element MEMO holds the element AS WRITTEN: a TS cast or a non-null on it is the
// receiver's own spelling, and both legs keep it - memoizing the peeled view dropped it on one leg
// while the other kept it, a divergence the import set cannot see
const arr = [3, [1, 2]] as number[];
const [{ at: viaCast }] = [(arr.flat() as any)];
const [{ at: viaNonNull }] = [arr.flat()!];
const [{ at: viaSatisfies }] = [(arr.flat() satisfies unknown)];
// ... and the same spelling rides the dispatch directly where no memo is minted
const { at: viaFlatCast } = (arr.flat() as any);
export { viaCast, viaNonNull, viaSatisfies, viaFlatCast };
