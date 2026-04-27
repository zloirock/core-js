// synth-swap bails when default receiver is a class expression: `function({from} = class
// extends Array {})` - the receiver isn't a bare Identifier (`isClassifiableReceiverArg`
// requires Identifier shape), so synth-swap can't statically pick a polyfill. inline-default
// fallback would also need to know the static methods of the anonymous class - which it
// doesn't. plugin emits the original code unchanged
function f({ from } = class extends Array {}) { return from; }
f();
