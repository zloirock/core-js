// a reassigned container read that more than one value may reach - a conditional, a branching, an ambiguous
// pattern, a logical or a for-in write, one in a closure - unions every value that may reach it: the init
// where a write may not run, each arm or candidate a write may store; a for-in head writes keys, so only
// the literal's static loads
let rw3 = { c: Object };
if (flag) rw3 = { c: Promise };
const { try: viaConditionalWrite, entries: viaLiveInit } = rw3.c;
let wBr = { b: Object };
wBr = flag ? { b: Number } : { b: Object };
const { b: { isSafeInteger: viaBranchingWrite } } = wBr;
let wAd = { d: Object };
({ 0: wAd = { d: Number } } = [{ d: Object }]);
const { d: { parseFloat: viaAmbiguousDefault } } = wAd;
let wLg = null;
wLg ||= { l: Object };
const { l: { hasOwn: viaLogicalBinding } } = wLg;
let wAn = { i: Object };
wAn &&= { i: Number };
const { i: { parseInt: viaAndBinding, isExtensible: viaAndInit } } = wAn;
let wFi = { f: Object };
for (wFi in { a: 1 }) void 0;
const { f: { getOwnPropertyDescriptors: viaForInLiteralOnly } } = wFi;
let wCl = { c: Object };
export const setIt = () => { wCl = { c: Number }; };
const { c: { isNaN: viaClosureWrite } } = wCl;
export { viaConditionalWrite, viaLiveInit, viaBranchingWrite, viaAmbiguousDefault, viaLogicalBinding, viaAndBinding, viaAndInit, viaForInLiteralOnly, viaClosureWrite };
