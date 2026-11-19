// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
(function({ from, ...rest }) { return [from, rest]; })(Array);
