// A pattern under a static destructures its ponyfill on declaration and assignment hosts.
// Nested instance claims read that same pure value; defaults stay dead where it is defined.
// Array wrappers, aliases, proxy hops and calls preserve effects and source bindings.
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
