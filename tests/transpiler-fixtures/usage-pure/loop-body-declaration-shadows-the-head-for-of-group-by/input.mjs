// a declaration in a loop's body block redeclaring the name the loop's head declares shadows the head inside
// the body - a let, a class, a function, a pattern, read before it in a closure, under a for-in head - so a
// read there reads the body's value, never an element the head iterates - nor the global a head named after
// one would leave the read to
for (const M of [Map]) {
  let M = pick();
  use(M.groupBy);
}
