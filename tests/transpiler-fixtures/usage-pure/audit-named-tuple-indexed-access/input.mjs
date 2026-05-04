// Named tuple element with indexed access: `[a: T, b: U][1]` should peel
// TSNamedTupleMember and resolve to the second element type.
type Pair = [items: number[], tags: string[]];
declare const t: Pair;
t[1].includes('x');
declare const second: Pair[1];
second.flat();
