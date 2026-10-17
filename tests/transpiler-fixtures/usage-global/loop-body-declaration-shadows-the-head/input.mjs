// a declaration in a loop's body block redeclaring the name the loop's head declares shadows the head inside
// the body, so a read there reads the body's value: an unknown one loads every family a member may need
// (`entries` the array and DOM collection instance methods beside the Object static), a typed one its own,
// and one named after a global loads nothing for it.
// the loops bring the iteration modules and each element its family
for (const I of [Iterator, Array]) {
  let I = pick();
  use((I || Object).entries);
}
for (const s of ['abc']) {
  let s = [1];
  use(s.at(-1));
}
for (const Promise of [Map]) {
  let Promise = pick();
  use(Promise.allSettled);
}
