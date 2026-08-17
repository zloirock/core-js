// `Symbol.iterator in x` rewrites to an is-iterable CALL, and the operand keeps the role `in`
// gave it: the helper reads it and throws on a nullish one. a guard rendered for the operand's own
// chain therefore stays INSIDE the argument - climbing out of the call answers undefined where the
// source throws, and strands the memo the climb built
export const collapsibleNav = Symbol.iterator in globalThis.window?.self;

// the same operand one hop deeper
export const collapsibleNavHop = Symbol.iterator in globalThis.window?.self.box;

// NEGATIVE: a non-proxy short-circuited operand never reached the climb - it renders the same
export const plainHost = Symbol.iterator in globalThis.box?.self;

// NEGATIVE: a defined operand has no guard to place at all
export const definedOperand = Symbol.iterator in [];

// the emitters agree on where the guard goes and differ only in grouping: a text splice keeps the
// parens it authored around the conditional, an AST reprint drops what precedence does not need

// a NON-iterator symbol keeps the membership test with the binding swapped, guard untouched
export const otherSymbol = Symbol.asyncIterator in globalThis.window?.self;
