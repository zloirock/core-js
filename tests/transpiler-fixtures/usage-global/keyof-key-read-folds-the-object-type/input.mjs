// `obj[k]` where `k: keyof X` and X is the object's type reads `X[keyof X]`: through the binding's own
// `typeof` for a literal it holds, through an annotation for a typed parameter
const LABELS = { ok: 'fine', bad: 'broken' } as const;
export function label(key: keyof typeof LABELS) {
  return LABELS[key].at(0);
}
interface Prices {
  low: number[];
  high: number[];
}
export function hasPrice(prices: Prices, key: keyof Prices) {
  return prices[key].includes(1);
}
