// `function f([a, ...{at}])` - array destructure with rest wrapping an inner object
// destructure. the function-param classification must walk through the rest, so the
// inner object destructure is still recognized as a function-param destructure
export function f([first, ...{
  at
}]) {
  return at;
}
// nested rest property wrapping deeper object destructure - depth check exercises the walk loop
export function g([head, ...[, ...{
  at
}]]) {
  return [head, at];
}