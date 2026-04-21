// polyfillable Symbol.X - seed handledObjects so outer rewrite subsumes the Symbol identifier
const a = Symbol.iterator in obj;
// unpolyfillable key (Symbol.match stage) - leave Symbol in place; identifier visitor must fire separately
const b = Symbol.match in obj2;
