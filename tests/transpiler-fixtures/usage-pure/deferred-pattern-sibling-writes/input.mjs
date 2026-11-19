// Several claims share the original receiver even when a computed key writes its alias.
// The retained length and following declarator remain behind both claimed reads.
const effects = [];
let values = [4, 7];
const original = values;
export const { [(effects.push('key'), values = { at() { return 'changed'; } }, 'at')]: method,
  [(effects.push('second'), 'includes')]: contains, length } = values,
  after = (effects.push('after'), 1);
export { effects, values, original };
