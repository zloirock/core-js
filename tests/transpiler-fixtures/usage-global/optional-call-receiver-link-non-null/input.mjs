// a `!` inside the receiver continues its chain: the live `?.` below the assertion is still the link
// the guard tests, and the receiver past it is read plainly with the assertion kept where the source
// wrote it, so a receiver that comes out nullish there throws at the method read, as the source does
declare const box: { list: number[][]; inner?: { list: number[] } } | null;
export const afterLink = box?.list!.flatMap?.(x => x).at(0);
export const beforeLink = box!?.list.flat?.().includes(1);
export const onMethod = box?.inner?.list.findLast!?.(Boolean).toFixed(1);
export const betweenHops = box?.inner!.list.toSorted?.().with(0, 1);
