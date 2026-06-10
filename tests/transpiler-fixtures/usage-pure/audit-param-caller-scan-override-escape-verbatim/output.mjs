// the call-site scan's NEGATIVE cases keep params VERBATIM: `over` is called with a real
// argument (the caller value must win over any lossy emission), `leak` escapes through an
// alias (external calls are unknown). distinct methods per function
function over({
  from,
  ...rest
} = Array) {
  return [from, rest];
}
over({
  from: 'custom'
});
function leak({
  of,
  ...rest
} = Array) {
  return [of, rest];
}
const alias = leak;
alias();