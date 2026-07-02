// nested minifier-collapsed destructure-in-sequence whose OUTER match sits inside a function
// body, not the Program body. the outermost-only split must reach matches in every statement
// list host, and the re-parse-and-repeat loop must keep finding the inner match after the
// enclosing body statement is rewritten. distinct statics confirm each destructure RHS fired
function host() {
  (pre(), ({ a } = Object.fromEntries(e)));
  ((function () { (mid(), ({ b } = Array.from(z))); }), ({ c } = Object.entries(w)));
}
