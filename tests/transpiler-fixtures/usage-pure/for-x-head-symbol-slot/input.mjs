// A symbol-keyed slot keeps its own value beside a polyfilled static in an assignment head.
// Both a direct symbol and its stable alias name the same slot on every iteration.
let tag, from, of;
for ({ [Symbol.toStringTag]: tag, from } of [Array, Array]) consume(tag, from([1]));
const key = Symbol.toStringTag;
for ({ [key]: tag, of } of [Array]) consume(tag, of(2));
