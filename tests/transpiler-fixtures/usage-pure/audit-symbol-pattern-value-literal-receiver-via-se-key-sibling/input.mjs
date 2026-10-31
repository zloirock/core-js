// A computed sibling key runs before the following iterator read and nested default.
let k = () => 'of';
const { [k()]: kf, [Symbol.iterator]: { name: nm = [2].at(0) } } = [3, 4];
export const viaSeKeySibling = [kf, nm];
