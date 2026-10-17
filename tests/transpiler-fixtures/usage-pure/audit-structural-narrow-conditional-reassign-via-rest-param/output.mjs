import _includes from "@core-js/pure/actual/instance/includes";
export function viaRestParam(c, ...xs) {
  if (c) xs = 'hello';
  return _includes(xs).call(xs, 1);
}