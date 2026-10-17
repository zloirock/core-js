import _Symbol from "@core-js/pure/actual/symbol";
const maybeRealm = flag ? _Symbol : {};
const undecidedKey = maybeRealm.iterator || '@@iterator';
export const undecidedRead = receiver => receiver[undecidedKey];