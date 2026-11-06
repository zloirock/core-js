import _at from "@core-js/pure/actual/instance/at";
// labeled `break` BEFORE the assignment inside its target block: `outer: { if (c)
// break outer; x = "hello"; }` - the break may exit the labeled block before the
// assignment runs. the preceding-sibling exit scan has no in-scope label at its root
// (only labels walked INTO count), so `break outer` is an exit and the narrow is rejected
let x = [1, 2, 3];
let c = true;
outer: {
  if (c) break outer;
  x = "hello";
}
_at(x).call(x, 0);