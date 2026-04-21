// `Array.prototype.at.call(arr, 0)` - buildMemberMeta for `Array.prototype.at.call`:
// outer key is 'call', object = `Array.prototype.at` MemberExpression. Inner check looks
// at `Array.prototype`'s object for `.prototype` match - but outer's object is `Array.prototype.at`,
// not `Array.prototype`. Should route to `prototype:{at.call}` - but buildMemberMeta checks `obj.property.name === 'prototype'`
// via resolveKey, so it sees obj.property = 'at', not 'prototype'. Falls through to regular member.
// `.at` member itself is detected as instance method separately
Array.prototype.at.call(arr, 0);
