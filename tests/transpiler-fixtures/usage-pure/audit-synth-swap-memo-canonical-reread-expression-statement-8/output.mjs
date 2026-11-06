// unresolvable call root: conservative verbatim bail on both emitters
function mk() {
  return null;
}
function callRootBail({
  union,
  rest
} = mk().self.Set) {
  return [union, rest];
}
callRootBail();