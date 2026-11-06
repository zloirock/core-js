// an arithmetic compound is still a write - the bail does not care about the value
const cc = { c: Object };
cc.c += 1;
const { c: { keys: literalOnly } } = cc;
export { literalOnly };
