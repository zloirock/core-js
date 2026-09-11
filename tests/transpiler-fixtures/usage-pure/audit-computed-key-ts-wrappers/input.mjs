// computed key wrapped in TS `as any` cast, and in TS non-null assertion `!` -
// plugin must see through both wrappers and resolve the identifier to its bound
// string literal `'iterator'`, treating both as `Symbol.iterator in obj`
const k = 'iterator';
Symbol[(k) as any] in obj;
Symbol[k!] in obj;
