// TS cast around the receiver combined with computed-key SE: `(Symbol as any)[(fn(),
// 'iterator')] in obj`. the walker peels the TS wrapper (via the pre-switch loop) AND
// descends into the computed-key SequenceExpression. asserts wrapper-peel + SE harvest
// compose correctly
declare const logCall: () => void;
declare const obj: any;
const r = (Symbol as any)[(logCall(), 'iterator')] in obj;
