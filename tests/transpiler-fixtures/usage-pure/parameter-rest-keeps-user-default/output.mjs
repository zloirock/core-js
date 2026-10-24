// Declining the receiver mirror must not replace the author's leaf default.
let calls = 0;
export const out = (({
  from = (calls++, 'own'),
  ...rest
} = Array) => [from, rest])();
export { calls };