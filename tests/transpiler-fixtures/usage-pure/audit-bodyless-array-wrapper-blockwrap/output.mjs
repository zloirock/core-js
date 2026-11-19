// Bodyless loops keep static wrapper reads and surviving siblings inside their control body.
// Native array iteration must not escape the do-while or while guard.

do var [{
  of: o
}, tail] = [Array, 0]; while (c);

// bodyless while: a distinct static - the residual must stay inside the loop, not run once after it
while (c) var [{
  from: g
}, rest] = [Array, 1];