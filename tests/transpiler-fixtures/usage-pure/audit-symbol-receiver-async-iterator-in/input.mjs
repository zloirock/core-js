// nested `Symbol[Symbol.asyncIterator]` as `in`-LHS — `in` rewrite bails; receiver
// Symbol and inner Symbol.asyncIterator polyfilled separately
const y = Symbol[Symbol.asyncIterator] in obj;
globalThis.__y = y;
