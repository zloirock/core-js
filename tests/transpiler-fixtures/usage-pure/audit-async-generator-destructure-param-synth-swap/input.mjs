// async generator destructure default + synth-swap. parallel to the generator case
// but the function modifier is `async function*`. the synth-swap rewrite is
// orthogonal to the function-kind decoration; same `{ from: _Array$from }` literal
async function* g({ from } = Array) {
  yield from([1]);
}
g();
