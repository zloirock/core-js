// `(Promise?.foo)?.bar.includes(2)` - an optional chain through a paren wrapper whose root
// is Promise. Promise is a polyfillable global (not one of the globals that ReferenceError
// on a bare lookup), yet it is still substituted to its polyfill and `.includes` narrows -
// substitution applies to any polyfillable global root.
(Promise?.foo)?.bar.includes(2);
