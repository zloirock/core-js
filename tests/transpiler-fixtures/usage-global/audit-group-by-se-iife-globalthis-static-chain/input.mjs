// the static call's receiver is a proxy-global produced by a SequenceExpression-prefixed IIFE
// (`(0, function(){return globalThis})()`); the wrapper must be peeled so `Map.groupBy` resolves
// and its dep is injected
(0, function () { return globalThis; })().Map.groupBy([], (x) => x);
