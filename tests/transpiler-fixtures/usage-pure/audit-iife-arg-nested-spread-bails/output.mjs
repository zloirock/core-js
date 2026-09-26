// a NESTED spread (`...tail`) inside the inline-array spread argument makes the destructured param's
// runtime position variadic - the synth-swap can't statically locate which argument feeds `{ from }`
// (tail expands to an unknown count), so it bails to native on BOTH emitters. a mis-counted lift would
// treat `...tail` as one position and swap the WRONG argument (`Array` here) for the synth literal, or
// fire a default that corrupts a user-object argument at the real runtime slot. `Array` stays the caller's
const tail = [{
  from: () => []
}];
const result = ((a, b, {
  from
} = []) => from)(...[0, ...tail, Array]);
result;