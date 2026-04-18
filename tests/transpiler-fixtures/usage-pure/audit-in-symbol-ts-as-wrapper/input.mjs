// TSAsExpression wraps `Symbol`; isInReceiverOfInExpression must peel it before
// matching the BinaryExpression(`in`) - otherwise a stray `_Symbol` import leaks
(Symbol as any).iterator in obj;
