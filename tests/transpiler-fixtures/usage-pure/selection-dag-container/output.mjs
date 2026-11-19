// Global candidates traverse shared container slots; pure keeps the native read.
const C0 = {
  a: Array
};
const C1 = {
  a: Array
};
const C2 = {
  a: first() ? C1 : C0
};
const C3 = {
  a: second() ? C2 : C1
};
C3.a.a.a.from([3]);