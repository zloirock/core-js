// a structure-preserving utility over a type nothing here resolves - an import, a member of one - is
// a value nothing is known about, served generically: a plain object without the method would leave
// an array reaching it unpolyfilled
import type { Items, Inventory } from './inventory';
export function first(items: Readonly<Items>) {
  return items.at(0);
}
export function hasSku(skus: Readonly<Inventory['skus']>, sku: string) {
  return skus.includes(sku);
}
