// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const promises = { C: Promise };
const maps = { C: Map };
export const { C: { groupBy } } = flag ? promises : maps;
export const { C: { canParse } } = flag ? { C: Iterator } : other ? { C: URL } : user;
export const { C: { for: named } } = { C: Symbol };
