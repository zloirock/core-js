// an alias whose body indexes back into itself closes a loop between member lookup and member
// enumeration, and the budget has to grow on the way round it - both directly and through the
// wrapper peel, which drives the same pair. the last row is the control: an indexed alias over a
// real declaration still names its family. distinct method per line so each row is attributable
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type SelfIndexed = SelfIndexed["k"];
declare const selfIndexed: SelfIndexed;
export const a = selfIndexed.at(0);
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type AwaitedSelfIndexed = Awaited<AwaitedSelfIndexed["k"]>;
declare const awaitedSelfIndexed: AwaitedSelfIndexed;
export const b = awaitedSelfIndexed.includes("x");
interface SelfMember {
  // @ts-expect-error a declaration read in its own annotation is the shape under test
  k: SelfMember["k"];
}
declare const selfMember: SelfMember;
export const c = selfMember.k.flatMap(f);
type Source = {
  k: number[];
};
declare const resolved: Source["k"];
export const d = resolved.entries();
