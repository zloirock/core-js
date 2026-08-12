// an alias whose body indexes back into itself closes a loop between member lookup and member
// enumeration, and the budget has to grow on the way round it - both directly and through the
// wrapper peel, which drives the same pair. the last row is the control: an indexed alias over a
// real declaration still names its family
type SelfIndexed = SelfIndexed["k"];
declare const selfIndexed: SelfIndexed;
export const a = selfIndexed.at(0);
type AwaitedSelfIndexed = Awaited<AwaitedSelfIndexed["k"]>;
declare const awaitedSelfIndexed: AwaitedSelfIndexed;
export const b = awaitedSelfIndexed.at(0);
interface SelfMember {
  k: SelfMember["k"];
}
declare const selfMember: SelfMember;
export const c = selfMember.k.at(0);
type Source = {
  k: number[];
};
declare const resolved: Source["k"];
export const d = resolved.at(0);
