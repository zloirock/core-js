// combined shape: IIFE arrow with destructured param where the receiver is `Array`
// (synth-swap rewrites the arg slot) + body uses `from([...])` from the destructure
// + outer optional chain on the call result guards the inner `.at(0)` polyfill
(({from}) => from([1, 2])?.at(0))(Array);
