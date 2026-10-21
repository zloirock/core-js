// Shared capture and receiver-default routes preserve independently supported claims.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
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
