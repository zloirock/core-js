// a CALL through a `keyof` key reads what each value returns, not the value: the fold answers the
// value's type, so the call stays generic - never the value's own family, which took the polyfill away
export function firstOf<T extends Record<string, () => number[]>>(table: T, key: keyof T) {
  return table[key]().at(0);
}
const makers = { one: () => [1], two: () => [2] };
export function hasOne(key: keyof typeof makers) {
  return makers[key]().includes(1);
}
