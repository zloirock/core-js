// A STATIC hop whose slot holds a PATTERN with no claim of its own (`{ of: { length: arity } }`)
// destructures the ponyfill itself: the plan anchors the static and the residual reads its pure
// binding (`({ length: arity } = _Array$of)`), on a declarator and on an assignment host alike, off
// the bare realm, `self`, a sequence-prefixed realm and a constructor whose static needs its own
// entry (`Map.groupBy`). A leaf claim beside the pattern keeps its own dispatch (the assignment host
// splits the hop into a declared ref, the overwrite and the residual - the declarator's own shape).
// A default or a rest under the hop keeps the source: the ponyfill is always defined, and a rest
// gathers what no read names. A constructor init anchors the same way (`{ from: { length } } = Array`,
// an alias of it, the member spelling, a static with its own entry). The unplugin sidecar spells one
// accepted asymmetry - the assignment split reads the import binding twice instead of minting a ref
// (the binding is that ref), the overwrite behind the residual. A CALL init the inline canon proves
// to yield the realm anchors on both legs: the call is dropped where it runs no effect and lifted
// ahead of the assignment where it does, so it still evaluates exactly once, where the source ran it.
const log = [];
function realm() {
  log.push('r');
  return globalThis;
}
const { Array: { of: { length: declared } } } = globalThis;
let assigned;
({ Array: { of: { length: assigned } } } = globalThis);
const { Array: { of: { name: declaredName, length: declaredTwo } } } = globalThis;
let assignedName, assignedTwo;
({ Array: { of: { name: assignedName, length: assignedTwo } } } = globalThis);
const { Map: { groupBy: { length: grouped } } } = globalThis;
const { Array: { of: { length: prefixed } } } = (log.push('e'), globalThis);
const { Array: { of: { length: defaulted = 9 } } } = globalThis;
const { Array: { of: { ...rest } } } = globalThis;
const { Array: { of: { length: beside }, from } } = globalThis;
const { Array: { of: { length: viaSelf } } } = self;
let called;
({ Array: { of: { length: called } } } = realm());
const { from: { length: ctorDeclared } } = Array;
let ctorAssigned;
({ from: { length: ctorAssigned } } = Array);
const Aliased = Array;
const { from: { length: ctorAlias } } = Aliased;
const { from: { length: ctorMember } } = globalThis.Array;
const { groupBy: { length: ctorEntry } } = Map;
export { declared, assigned, declaredName, declaredTwo, assignedName, assignedTwo, grouped, prefixed, defaulted, rest, beside, from, viaSelf, called, log };
export { ctorDeclared, ctorAssigned, ctorAlias, ctorMember, ctorEntry };
