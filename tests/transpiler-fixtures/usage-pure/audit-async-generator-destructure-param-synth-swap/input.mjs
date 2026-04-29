// async generator destructure default + receiver-rewrite. The function modifier
// `async function*` does not change the rewrite outcome - the receiver-rewrite is
// orthogonal to the function-kind decoration; same `{ from: _Array$from }` literal
async function* g({ from } = Array) {
  yield from([1]);
}
g();
