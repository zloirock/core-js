// a computed member key that merely SPELLS 'Symbol.iterator' as a string (literal /
// template / concat / string alias) is a plain property read, not the well-known symbol -
// every form must stay untouched with native semantics (undefined read, TypeError on call)
const arr = [1, 2];
export const read = arr['Symbol.iterator'];
export const call = () => arr['Symbol.iterator']();
export const viaTemplate = arr[`Symbol.iterator`];
export const viaConcat = arr['Symbol.' + 'iterator'];
const stringKey = 'Symbol.iterator';
export const viaAlias = arr[stringKey];
export const viaOptionalReceiver = arr?.['Symbol.iterator'];
export const viaOptionalCall = () => arr['Symbol.iterator']?.();
let effects = 0;
export const viaSePrefixedKey = arr[(effects++, 'Symbol.iterator')];