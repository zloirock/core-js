// a loop's body redeclaring the head's name binds it apart: a dispatching prototype installed on the head
// leaves the body's array the array family, and one installed on the body's object leaves the head's array
// its family too - each binding reads only the installs made through it. distinct method per line
for (let a = {}; Object.setPrototypeOf(a, String.prototype), c; ) {
  let a = [1, 2];
  use(a.includes(2));
  break;
}
for (let b = [1, 2]; b.at(0); ) {
  let b = {};
  Object.setPrototypeOf(b, String.prototype);
  break;
}
