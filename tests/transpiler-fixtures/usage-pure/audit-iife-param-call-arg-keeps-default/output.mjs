// A CALL-EXPRESSION IIFE arg (`getArr()`) is NOT a safe-access proxy-global, so it stays un-classifiable:
// the param-default is kept and the call is preserved verbatim. Synth-swapping the call onto the dead
// default would DROP the call (and any side effects), so only a (member-expression) safe-access arg can
// supersede a dead default - a call, even one that inline-resolves to a constructor, may not.
const getArr = () => Array;
const r = (({
  from
} = Object) => from([1]))(getArr());
export { r };