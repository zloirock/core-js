// A TS non-null wrapper (`!`) sitting under the outer member of a combined optional poly-chain must
// not break the intermediate-hop marking walk. `arr.flat?.().map(x => x)!.at(-1)` combines the
// optional chain into a single null-guarded emit; a wrapper-blind marking walk stops at the `!`,
// leaves the inner poly hops unmarked, and the visitor re-matches the same inner chain - queuing an
// overlapping transform that crashes ("could not locate inner needle").
const arr: number[] = [1];
arr.flat?.().map(x => x)!.at(-1);
