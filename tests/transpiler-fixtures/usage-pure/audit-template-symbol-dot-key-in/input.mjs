// `Symbol.${v}` template resolves to a `Symbol.X` string when `v` resolves via binding or
// literal concat - resolveKey returns it from `node.left`, then handleBinaryIn's second
// branch (`resolvedLeft?.startsWith('Symbol.')`) picks it up. the in-check rewrites to
// the `Symbol.iterator` polyfill even though the template literal itself isn't a member
// expression - handleBinaryIn's first branch (asSymbolRef on left.object) bails since
// TemplateLiteral has no `.object`
const key = 'iter' + 'ator';
`Symbol.${ key }` in obj;
