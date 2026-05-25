// reassignment inside a NESTED-block sibling (not a direct ExpressionStatement assignment,
// but reachable conditionally via the if-body) must also bail the preceding-block-assignment
// scan. constantViolations include the nested write, and its position falls between the
// candidate hit and the use site - so the position-window check catches it
let f;
f = { data: [1, 2, 3] };
if (Math.random() > 0.5) {
  if (Math.random() > 0.5) {
    f = { data: 'string' };
  }
}
f.data.at(-1);
