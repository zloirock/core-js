// A wrapper holds an alias of the original container. Writing through its slot replaces
// the original constructor before the read, so neither flavor imports Array.from or
// its dependencies. The installed custom method stays intact.
const original = {
  x: Array
};
const local = original;
const alias = {
  box: local
};
alias.box.x = {
  from: () => 'custom'
};
original.x.from([1]);