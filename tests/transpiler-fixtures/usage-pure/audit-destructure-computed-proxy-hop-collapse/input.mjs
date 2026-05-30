// proxy-global member chain whose intermediate hop is a COMPUTED key (`globalThis['self']`).
// the collapse must recognise the static computed key just like the dotted form and drop it,
// emitting `_globalThis.Array` rather than the runtime-undefined `_globalThis['self'].Array`
const { of, other } = globalThis['self'].Array;
of(1, 2);
console.log(other);
