// `in` folds to a constant only while its right operand cannot be the undefined that `in` THROWS on.
const src = [3, [1, 2]];
const words = ['ab', 'cd'];
export function probes(absent) {
  const arr = absent ? null : src;
  const list = absent ? null : words;
  return [
    'flat' in (arr?.slice()),
    'at' in arr?.slice(),
    'includes' in (list?.concat([])),
    'entries' in arr?.slice().slice(),
  ];
}
