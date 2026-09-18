// The lexical loop binding shadows the outer binding only inside the loop.
// Its Map escapes; the outer Set stays local and needs only its constructor in pure.
function expose() {
  let value = Set;
  for (let [value] of [[Map]]) hand(value);
  void value.name;
}
