import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a structure-preserving utility over a type nothing here resolves - an import, a member of one - is
// a value nothing is known about, served generically: a plain object without the method would leave
// an array reaching it unpolyfilled
import type { Items, Inventory } from './inventory';
export function first(items: Readonly<Items>) {
  return _at(items).call(items, 0);
}
export function hasSku(skus: Readonly<Inventory['skus']>, sku: string) {
  return _includes(skus).call(skus, sku);
}