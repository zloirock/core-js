import _Array$from from "@core-js/pure/actual/array/from";
// async generator destructure default + receiver-rewrite. The function modifier
// `async function*` does not change the rewrite outcome - the receiver-rewrite is
// orthogonal to the function-kind decoration; same `{ from: _Array$from }` literal
async function* g({
  from
} = {
  from: _Array$from
}) {
  yield from([1]);
}
g();