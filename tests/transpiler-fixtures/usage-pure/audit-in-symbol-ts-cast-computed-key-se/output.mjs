import _isIterable from "@core-js/pure/actual/is-iterable";
// TS cast around the receiver combined with computed-key SE: `(Symbol as any)[(fn(),
// 'iterator')] in obj`. the walker peels the TS wrapper (via the pre-switch loop) AND
// descends into the computed-key SequenceExpression. asserts wrapper-peel + SE harvest
// compose correctly
declare const logCall: () => void;
declare const obj: any;
const r = (logCall(), _isIterable(obj));