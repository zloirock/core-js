// an array-wrapper static extract (`[{ k: v }, tail] = [Ctor, ...]`) binds the polyfill BEFORE the surviving
// residual array destructure. in a bodyless control body the two join as the declarators of ONE `var` - a
// do-while body holding two bare statements is unparsable, and a while/if residual would otherwise escape
// the loop / guard

// bodyless do-while: two bare statements in the body would be unparsable without the join
do var [{ of: o }, tail] = [Array, 0]; while (c);

// bodyless while: a distinct static - the residual must stay inside the loop, not run once after it
while (c) var [{ from: g }, rest] = [Array, 1];
