// A wrapper holds an alias of a nested member. Writing through that captured path replaces
// the original constructor before the read, so neither flavor imports Array.from or
// its dependencies. The installed custom method stays intact.
const original = {
  part: {
    x: Array
  }
};
const local = original.part;
const alias = {
  box: local
};
alias.box.x = {
  from: () => 'custom'
};
original.part.x.from([1]);