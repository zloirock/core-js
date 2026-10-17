// NEGATIVE: a written value that resolves to no constructor contributes nothing beside the literal
const localX = { assign: 1 };
const cnc = { k: Object };
cnc.k = localX;
const { assign: literalOnlyValue } = cnc.k;
export { literalOnlyValue };
