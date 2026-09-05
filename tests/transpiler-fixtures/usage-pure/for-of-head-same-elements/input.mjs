// a for-x HEAD over a LONGER literal answers a static claim when every element reads the same on
// every pass: one identifier, or a literal container spelling the same keys and positions over such
// leaves. the render still mirrors each element on its own. one static per row
for (const { is: viaIdentifiers } of [Object, Object]) viaIdentifiers;
for (const { w: { keys: viaHop } } of [{ w: Object }, { w: Object }]) viaHop;
for (const [{ values: viaWrap }] of [[Object], [Object]]) viaWrap;
for (const { w: [{ entries: viaHopWrap }] } of [{ w: [Object] }, { w: [Object] }]) viaHopWrap;
for (const { w: { x: { hasOwn: viaTwoHops } } } of [{ w: { x: Object } }, { w: { x: Object } }]) viaTwoHops;
// ... read through the transparent wrappers a source may spell (a paren node one parser keeps)
for (const { w: { isFrozen: viaParens } } of [{ w: (Object) }, { w: Object }]) viaParens;

// a DUAL name (a static and an instance method alike: `entries`, `keys`, `values`) under a hop is the
// mirror's claim like a static-only one: the relocation that minted a host for it read the leaf
// typelessly as an instance method and lost the constructor's name (`_entries(_ref.w)`)
for (const { w: { entries: viaDualHop } } of [{ w: Object }]) viaDualHop;
for (const { w: { keys: viaDualMulti } } of [{ w: Object }, { w: Object }]) viaDualMulti;
for (const { w: [{ values: viaDualWrap }] } of [{ w: [Object] }]) viaDualWrap;
for (const { w: { entries: viaDualDefault = null } } of [{ w: Object }]) viaDualDefault;
for (const [{ keys: viaDualArrayHead }] of [[Object], [Object]]) viaDualArrayHead;
// ... beside a leaf the mirror cannot answer, the head relocates for that leaf and the static
// still extracts: the relocated pattern reads the iterated literal's element, not the minted name
// (a pattern the source wrote that way reads the same), and a primitive slot differing per pass
// carries no claim
for (const { w: { entries: viaDualBesideData }, at: viaDataBeside } of [{ w: Object, at: 1 }]) [viaDualBesideData, viaDataBeside];
for (const { w: { values: viaDualBesideInstance }, y: { at: viaInstanceBeside } } of [{ w: Object, y: [1] }]) [viaDualBesideInstance, viaInstanceBeside];
for (const viaWritten of [{ w: Object }]) { const { w: { keys: viaWrittenKeys } } = viaWritten; viaWrittenKeys; }
for (const { w: { is: viaPrimitiveSlots }, z } of [{ w: Object, z: 's' }, { w: Object, z: 2 }]) [viaPrimitiveSlots, z];

// NEGATIVES: an element reading DIFFERENTLY on some pass - another value, another key, a getter, an
// extra slot, a spread, a hole - leaves the head to the generic relocation or native
for (const { w: [{ freeze: viaOtherValue }] } of [{ w: [Object] }, { w: [userObj] }]) viaOtherValue;
for (const { w: { seal: viaOtherKey } } of [{ w: Object }, { v: Object }]) viaOtherKey;
for (const { w: { assign: viaGetter } } of [{ w: Object }, { get w() { return Object; } }]) viaGetter;
for (const { w: { groupBy: viaExtraSlot } } of [{ w: Object, z: 1 }, { w: Object, z: 2 }]) viaExtraSlot;
for (const { w: { fromEntries: viaSpread } } of [{ w: Object }, { w: Object, ...more }]) viaSpread;
for (const [{ getOwnPropertyNames: viaHole }] of [[Object], [, Object]]) viaHole;
// ... and a pattern written further down the body reads the loop variable as a plain binding
for (const viaLater of [{ w: Object }]) { const z = 1; const { w: { keys: viaLaterKeys } } = viaLater; [z, viaLaterKeys]; }

// an emptied SOLE host with a pure init leaves on both legs, the wrapper husk included; a neighbour
// element that runs lifts as a statement ahead, in source order (the `push` claims are carriers)
let { w: { entries: viaEmptiedObject }, y: { at: viaEmptiedObjectAt } } = rec;
[viaEmptiedObject, viaEmptiedObjectAt];
const [{ w: { values: viaEmptiedWrap }, y: { at: viaEmptiedWrapAt } }] = [rec];
[viaEmptiedWrap, viaEmptiedWrapAt];
const [{ w: { keys: viaEmptiedEffect }, y: { at: viaEmptiedEffectAt } }] = [rec, log.push('n')];
[viaEmptiedEffect, viaEmptiedEffectAt];
const [, { w: { entries: viaEmptiedLead }, y: { at: viaEmptiedLeadAt } }] = [log.push('l'), rec];
[viaEmptiedLead, viaEmptiedLeadAt];
// ... and ahead of the STATICS the host extracted earlier: the source ran the element first
const known = { w: Object, y: [1] };
const [{ w: { is: viaEmptiedStatic }, y: { at: viaEmptiedStaticAt } }] = [known, log.push('s')];
[viaEmptiedStatic, viaEmptiedStaticAt];
export { viaEmptiedObject, viaEmptiedWrap, viaEmptiedEffect, viaEmptiedLead, viaEmptiedStatic };
