// combo: IIFE with destructured param + synth-swap on Array receiver + outer optional chain
// on the call result + instance.at polyfill on the optional target
(({from}) => from([1, 2])?.at(0))(Array);
