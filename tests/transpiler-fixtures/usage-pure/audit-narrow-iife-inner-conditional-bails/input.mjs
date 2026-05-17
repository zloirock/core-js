// inner expression chain inside an IIFE body: `false && (x = "hello")` conditionally
// guards the assignment. ancestor + sibling checks already validate statement-level
// reachability inside the IIFE; this fixture asserts the expression chain from the
// assignment up to the inner ExpressionStatement is also validated - without that the
// lift accepts the conditional write as straight-line, narrowing x to "hello" (SOUNDNESS)
let x = [1, 2, 3];
(() => { false && (x = "hello"); })();
x.at(0);
