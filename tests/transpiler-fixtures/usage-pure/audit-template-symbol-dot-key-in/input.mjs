// `` `Symbol.${v}` `` folds to the string `'Symbol.X'` via TemplateLiteral + literal concat,
// but that's still a string — `isSymbolSourcedKey` rejects template-literal sources. the
// symbol-in short-circuit skips and `obj` isn't a known static, so no polyfill emitted.
// `k`'s init `'iter' + 'ator'` folds to a string too but `k` itself is unused here
const key = 'iter' + 'ator';
`Symbol.${key}` in obj;
