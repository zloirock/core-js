// A symbol-iterator value keeps the claims nested beneath its pattern.
// Sibling statics must not hide instance properties read from that value.
const { [Symbol.iterator]: { name } } = globalThis;
const { [Symbol.iterator]: { name: viaAlias } } = globalThis;
const { Set: { customQ }, [Symbol.iterator]: { name: viaSibling } } = globalThis;
// NEGATIVES. two leaves keep the destructure: each polyfilled leaf would need the receiver again,
// and the receiver is the synth CALL - re-running it re-reads the source's `Symbol.iterator`
const { [Symbol.iterator]: { name: twoA, bind: twoB } } = globalThis;
// a leaf needing no polyfill stays a plain read, and a non-pattern value keeps the plain synth
const { [Symbol.iterator]: { bind } } = globalThis;
const { [Symbol.iterator]: plain } = globalThis;
// a non-proxy receiver reaches the synth through the emitters' own symbol route rather than the
// plan - it asks the SAME shared helper, so the leaf resolves there too, with or without a sibling
const { [Symbol.iterator]: { name: viaCtor } } = Array;
const { of, [Symbol.iterator]: { name: viaSiblingCtor } } = Array;
// NEGATIVE: a DEFAULTED leaf keeps the destructure - binding the dispatcher result directly would
// drop the user's default, and guarding it is the instance-default channel's own shape
const { [Symbol.iterator]: { name: viaDefault = fallback() } } = Array;
console.log(name, viaAlias, viaSibling, customQ, twoA, twoB, bind, plain, viaCtor, of, viaSiblingCtor, viaDefault);
