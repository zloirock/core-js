// TSTypeOperator with `unique` operator wrapping symbol keyword. resolveTypeAnnotation's
// TSTypeOperator branch unwraps any operator except `keyof`. `unique symbol` should
// resolve to symbol primitive. Probe via array-of element narrowing - if the operator
// peels correctly, an array of unique symbols still narrows to Array dispatch.
declare const ks: (unique symbol)[];
ks.at(0);
ks.findLast(x => true);
