// a receiver read in a DEFERRED context runs after the surrounding statements, so a write that
// lands textually after it still reaches it - the declarator init alone no longer describes the
// receiver there. the type is then the UNION of the init and every reachable write: a NULLISH arm
// drops out (a member access on it throws natively, so no polyfill can apply), so a nullish-init
// binding narrows to the write's own type. arms of DIFFERENT dispatching families share no common
// type, but the union still names them: the injected set is exactly those families, never the whole
// method - a receiver family no arm can hold is provably impossible and must not be pulled in. the
// deferred contexts are a re-invoked closure and a non-static class-field
// initializer (it runs at construction). the boundaries keep their init narrow: a use in the SAME
// activation stays positionally ordered, an IIFE body and a class STATIC member run at their
// definition position (so the later write cannot reach them), and an unwritten binding keeps its
// init type. the rows that assert an INFERENCE outcome use a multi-prototype method, so the emitted
// set itself shows which way it went: a narrowed receiver keeps only its own variant, a two-family
// union keeps exactly those two (`includes` keeps the array and string ones and drops the iterator
// one), and a fully unknown receiver keeps every variant. distinct method per line so each row is
// attributable
let captured = null;
const read = () => captured.at(0);
captured = [];
export const a = read();
let sameScope = null;
sameScope = [1];
export const b = sameScope.flatMap(f);
let straightLine = null;
export const c = (() => straightLine.padStart(2))();
straightLine = "x";
let neverWritten = null;
export const d = neverWritten.findLast(f);
let instanceField = "s";
class WithField {
  held = instanceField.includes(1);
}
instanceField = [];
export const e = new WithField();
let staticField = null;
class WithStatic {
  static held = staticField.copyWithin(0);
}
staticField = [];
export const g = WithStatic;
