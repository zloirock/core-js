// A `var` only redeclares, and in a CommonJS wrapper it starts out holding the loader the host
// passed in as a parameter - so our call at the top of the body still reaches the real `require`
// and the spelling stays. The body's own `module.exports` is what says this is that host.
var require = wrap(require);
module.exports = [1, 2, 3].at(0);
