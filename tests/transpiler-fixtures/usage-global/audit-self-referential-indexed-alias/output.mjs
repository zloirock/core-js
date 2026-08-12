import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// an alias whose body indexes back into itself closes a loop between member lookup and member
// enumeration, and the budget has to grow on the way round it - both directly and through the
// wrapper peel, which drives the same pair. the last row is the control: an indexed alias over a
// real declaration still names its family. distinct method per line so each row is attributable
type SelfIndexed = SelfIndexed["k"];
declare const selfIndexed: SelfIndexed;
export const a = selfIndexed.at(0);
type AwaitedSelfIndexed = Awaited<AwaitedSelfIndexed["k"]>;
declare const awaitedSelfIndexed: AwaitedSelfIndexed;
export const b = awaitedSelfIndexed.includes("x");
interface SelfMember {
  k: SelfMember["k"];
}
declare const selfMember: SelfMember;
export const c = selfMember.k.flatMap(f);
type Source = {
  k: number[];
};
declare const resolved: Source["k"];
export const d = resolved.entries();