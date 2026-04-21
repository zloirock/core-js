// TemplateLiteral with interpolations. resolveKey folds `${a}${a}` to 'iteriter'
// - not Symbol.X, so no Symbol entry is picked (no polyfill)
const a = 'iter';
Symbol[`${a}${a}`] in obj;
// TemplateLiteral resolves to 'iterator' - Symbol.iterator polyfillable entry hits
const part1 = 'iter', part2 = 'ator';
Symbol[`${part1}${part2}`] in obj;
