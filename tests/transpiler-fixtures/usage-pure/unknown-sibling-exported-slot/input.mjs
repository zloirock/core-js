// The uncertain nested receiver needs a private capture. Exported destructuring exposes
// only the source binding, while its guard still preserves an overriding constructor.
const ns = { Q: Array, [key]: Map };
export const { Q: { of: method } } = ns;
