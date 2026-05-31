// an UpdateExpression on a static of a pure-importable constructor (`Promise.allSettled++`) must
// NOT rewrite the receiver to its pure import: `_Promise.allSettled++` writes a frozen const-import
// slot AND desyncs from the sibling native read. babel leaves both untouched (the `++` value wins
// on read); unplugin now mirrors it by marking the receiver. a genuinely-read pure static elsewhere
// (`Map.groupBy`) still polyfills - distinct builtins prove the gate is update-operand-specific.
Promise.allSettled++;
Promise.allSettled([p]);
Map.groupBy([], x => x);
