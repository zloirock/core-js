// The local true condition decides the call operand. The inline call still runs once before the Array
// static is bound. `logical-and-right-iife-keeps-its-gate` keeps the right-IIFE short circuit live
// under an undecided condition.
let calls = 0;
const cond = true;
const {
  from
} = cond && (() => {
  calls++;
  return Array;
})();
