function dead() {
  if (typeof Promise == 'undefined') return [1];
  return 'abc';
}
export const fromDead = dead().includes('b');
