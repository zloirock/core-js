// Array-wrapped statics and surviving siblings stay inside their control body.
// A bodyless loop or conditional must keep all reads and writes under its guard.

// bodyless do-while: two bare statements in the body would be unparsable without the join
do var [{ of: o }, tail] = [Array, 0]; while (c);

// bodyless while: a distinct static - the residual must stay inside the loop, not run once after it
while (c) var [{ from: g }, rest] = [Array, 1];
