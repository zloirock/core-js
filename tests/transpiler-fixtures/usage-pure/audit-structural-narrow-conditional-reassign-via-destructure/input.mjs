export function viaDestructure(c) {
  let { a } = { a: [1, 2] };
  if (c) a = 'hello';
  return a.at(0);
}
