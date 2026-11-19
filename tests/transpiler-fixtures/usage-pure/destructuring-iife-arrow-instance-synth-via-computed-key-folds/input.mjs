// A computed key with a known string value extracts the method from the actual receiver.
export const viaComputedKeyFolds = (({ ["at"]: aKey }) => aKey)([1, 2]);
