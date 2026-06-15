// Same TS non-null wrapper under the outer member, but with MORE intermediate poly hops between the
// optional `flat?.()` and the outer `.at` (map + filter). The marking walk must peel the `!` and
// reach the optional chainStart so every intermediate hop is marked; a wrapper-blind walk stopped at
// the `!`, left map/filter unmarked, re-matched the inner chain, and crashed the transform queue.
const arr: number[] = [1];
arr.flat?.().map(x => x).filter(Boolean)!.at(-1);
