// A sole nested instance assignment reads its class getter exactly once in the dispatch.
// Bodyless and discarded-sequence hosts preserve the same evaluation slot.
// The quiet member receiver and declaration keep their existing typed dispatches.
class Source {
  static get A() { read(); return Array; }
  static get S() { read(); return String; }
}
let a, b, c;
({ prototype: { at: a } } = Source.A);
if (run) ({ prototype: { includes: b } } = Source.S);
(before(), ({ prototype: { findLast: c } } = Source.A), after());
const quiet = { A: Array };
let d;
({ prototype: { toReversed: d } } = quiet.A);
const { prototype: { findLastIndex: e } } = Source.A;
use(a, b, c, d, e);
