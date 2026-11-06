const maybeRealm = flag ? Symbol : {};
const undecidedKey = maybeRealm.iterator || '@@iterator';
export const undecidedRead = receiver => receiver[undecidedKey];
