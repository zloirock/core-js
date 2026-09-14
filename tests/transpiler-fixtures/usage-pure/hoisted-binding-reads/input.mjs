// A binding read ahead of its own initializer holds `undefined` (a hoisted `var` declared below the
// read) or throws (a lexical binding in its TDZ). Every resolution that follows a binding to the
// literal it holds - the static container, the alias chain, the array-wrapper slot, the folded key,
// the inner default's slot - proves the initializer ran first (the dominance canon), or the rewrite
// would bind where the source throws: those reads stay native here, while their declared-before
// twins resolve. Both legs read one follower.
let r1, r2, r3, r4, r5;
try { const { a: { from } } = container; r1 = from([1]).length; } catch (error) { r1 = error.name; }
try { const alias = container; const { a: { from } } = alias; r2 = from([1]).length; } catch (error) { r2 = error.name; }
try { const [{ from }] = wrapper; r3 = from([1]).length; } catch (error) { r3 = error.name; }
{ const { [key]: from } = Array; r4 = typeof from; }
{ const [{ of } = Array] = [slot]; r5 = of(1)[0]; }
let r6;
try { const { Array: { from } } = realm(); r6 = from([1]).length; } catch (error) { r6 = error.name; }
var container = { a: Array };
var realm = () => globalThis;
var wrapper = [Array];
var key = 'from';
var slot = { of: x => [x, 'late'] };
const { a: { from: declaredFrom } } = container;
const [{ from: wrappedFrom }] = wrapper;
const { [key]: keyedFrom } = Array;
const [{ of: slotOf } = Array] = [slot];
const { Array: { from: calledFrom } } = realm();
export { r1, r2, r3, r4, r5, r6, declaredFrom, wrappedFrom, keyedFrom, slotOf, calledFrom };
