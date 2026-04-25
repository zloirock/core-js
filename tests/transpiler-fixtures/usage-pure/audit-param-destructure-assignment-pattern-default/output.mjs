import _Array$from from "@core-js/pure/actual/array/from";
// function param with inner default value: `{ from = [] }` - the user's `[]` default is
// only reachable when `Array.from` is missing on the fallback receiver. with receiver
// substitution the polyfill-id is always defined, so the inner default is dead after the
// rewrite. rewrite correctly peels the inner AssignmentPattern around `from` so the whole
// pattern still polyfills instead of bailing to a native fallback
function firstItem({
  from = []
} = {
  from: _Array$from
}) {
  return from([1, 2, 3]);
}
export { firstItem };