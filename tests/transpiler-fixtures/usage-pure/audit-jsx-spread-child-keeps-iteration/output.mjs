import _Array$from from "@core-js/pure/actual/array/from";
// A JSX spread child iterates its operand exactly as a spread attribute does, so an argument
// carrying one is not effect-free and the receiver in front of it has to survive. The plain
// expression container is the negative: it wraps its child without iterating, so it still folds.
export const spreadChild = ((() => Array)(<div>{...poison}</div>), _Array$from)(a);
export const spreadAttribute = ((() => Array)(<div {...poison} />), _Array$from)(b);
export const expressionContainer = _Array$from(c);
export const emptyElement = _Array$from(d);