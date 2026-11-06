// A leaf default and surviving sibling both read the initializer's original navigation.
// The receiver is this, not the whole constructor-valued initializer.
exports.Array = Array;
const { prototype: { at = fallback() }, isArray } = this.Array;
exports.result = [at, isArray];
