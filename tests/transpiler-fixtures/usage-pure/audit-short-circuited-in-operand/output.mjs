import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _self from "@core-js/pure/actual/self";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// `Symbol.iterator in x` rewrites to an is-iterable CALL, and the operand keeps the role `in`
// gave it: the helper reads it and throws on a nullish one. a guard rendered for the operand's own
// chain therefore stays INSIDE the argument - climbing out of the call answers undefined where the
// source throws, and strands the memo the climb built
export const collapsibleNav = _isIterable(null == _globalThis.window ? void 0 : _self);

// the same operand one hop deeper
export const collapsibleNavHop = _isIterable(null == _globalThis.window ? void 0 : _self.box);

// NEGATIVE: a non-proxy short-circuited operand never reached the climb - it renders the same
export const plainHost = _isIterable(_globalThis.box?.self);

// NEGATIVE: a defined operand has no guard to place at all
export const definedOperand = _isIterable([]);

// the emitters agree on where the guard goes and differ only in grouping: a text splice keeps the
// parens it authored around the conditional, an AST reprint drops what precedence does not need

// a NON-iterator symbol keeps the membership test with the binding swapped, guard untouched
export const otherSymbol = _Symbol$asyncIterator in (null == _globalThis.window ? void 0 : _self);