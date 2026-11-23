// A named parameter consumes a receiver inside an array and an object wrapper. The supplied
// static gets a polyfill at that source slot; a custom slot is never replaced by the first caller.
// The wrappers do not expose Array itself or require its other statics.
function read({ slot: [{ of }] }) { return of; }
read({ slot: [Array] })([1, 2]);
read({ slot: [{ of: value => value }] })(3);
read({ slot: [{}] });
