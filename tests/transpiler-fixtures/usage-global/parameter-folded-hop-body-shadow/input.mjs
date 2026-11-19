// Moving the nested receiver must not move the hop's reference into its body scope.
const Y = 'y';
export function read([{ [Y]: { at } }] = source()) {
  let Y;
  return at;
}
