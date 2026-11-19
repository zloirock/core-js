import _at from "@core-js/pure/actual/instance/at";
export function viaDestructure(c) {
  let {
    a
  } = {
    a: [1, 2]
  };
  if (c) a = 'hello';
  return _at(a).call(a, 0);
}