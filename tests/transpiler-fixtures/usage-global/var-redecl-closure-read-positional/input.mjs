// the straight-line read stays positional: the re-declaration before the read wins outright
function positional() {
  var a = [1, 2];
  { var a = [3, 4].values(); }
  return a.find(Boolean);
}
export const r = [positional()];
