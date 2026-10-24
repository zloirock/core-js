// NEGATIVE: an arithmetic compound derives its value - no reaching candidate beside the literal's
const cc = { c: Object };
cc.c += 1;
const { c: { keys: literalOnly } } = cc;
export { literalOnly };
