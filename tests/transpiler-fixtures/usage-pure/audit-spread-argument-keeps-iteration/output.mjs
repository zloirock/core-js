import _Array$from from "@core-js/pure/actual/array/from";
// A spread iterates its operand, so an argument list carrying one is never effect-free: folding the
// receiver away would drop that iteration (and the TypeError a non-iterable owes). The first call
// keeps its receiver in a sequence exactly as a plainly effectful argument does, while the two
// controls below still fold - a blanket "arguments are effectful" answer would lose them.
// usage-global is not paired: that method only adds imports and never rewrites the receiver, so the
// spread survives there either way and the row could not tell its claim from its negation.
export const spread = ((() => Array)(...poison), _Array$from)(a);
export const effectful = ((() => Array)(effect()), _Array$from)(b);
export const plain = _Array$from(c);
export const empty = _Array$from(d);

// a spread nested inside a literal argument reaches the same answer through the container rather
// than through a check the container repeats itself; the pure literals beside it still fold, which
// is what separates the answer from a blanket "any literal argument is effectful"
export const inArrayLiteral = ((() => Array)([...poison]), _Array$from)(e);
export const inObjectLiteral = ((() => Array)({
  ...poison
}), _Array$from)(f);
export const pureArrayLiteral = _Array$from(g);
export const pureObjectLiteral = _Array$from(h);

// depth and operand shape do not change the answer: the spread is found through a nested container
// and through another call's argument list, and its operand may itself be a spread or a sequence
export const nestedContainer = ((() => Array)([[...poison]]), _Array$from)(i);
export const throughCallArgument = ((() => Array)(sink(...poison)), _Array$from)(j);
export const spreadOfSpread = ((() => Array)([...[...poison]]), _Array$from)(k);
export const sequenceOperand = ((() => Array)(...(first, poison)), _Array$from)(l);