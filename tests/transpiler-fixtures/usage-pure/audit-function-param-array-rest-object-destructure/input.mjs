// `function f([a, ...{at}])` - array destructure with rest property wrapping an object
// destructure. the function-param-destructure check walks the rest property transparently
// (same as default-value-param LHS + array destructure siblings), so the inner object
// destructure is classified as function-param-destructure. without the walk, dispatch
// was skipped and the helper returned false for any object destructure reached through a
// rest wrapper. regression smoke test: ensure the construct doesn't crash + classification
// path runs
export function f([first, ...{ at }]) {
  return at;
}
// nested rest property wrapping deeper object destructure - depth check exercises the walk loop
export function g([head, ...[, ...{ at }]]) {
  return [head, at];
}
