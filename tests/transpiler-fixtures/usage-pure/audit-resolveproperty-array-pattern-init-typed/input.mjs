// resolveBindingType handles ArrayPattern destructure with the annotation living on the
// init expression rather than the pattern. resolveArrayBinding walks the init's
// findExpressionAnnotation path. Each binding then resolves to a string-typed entry
// from the tuple and the chained call narrows to string-specific instance method
declare const tup: [string, string[], string];
const [first, mid, last] = tup;
first.includes('a');
mid.findLast(x => x);
last.at(0);
