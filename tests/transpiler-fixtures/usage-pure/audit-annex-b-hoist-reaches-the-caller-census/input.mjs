// sloppy Annex-B (B.3.3): a block-level `function` is function-scoped, so a caller past the block
// reaches it and overrides the parameter slot - the tracker's block binding records no such caller,
// and its reference list is no proof that the default's type describes the parameter. the second
// pair is the boundary: a declaration the owner holds directly keeps the narrow
if (c) {
  function hoisted(x = 'abc') { return x.at(0); }
}
hoisted([1, 2]);
function direct(y = 'abc') { return y.includes('a'); }
direct();
module.exports = 1;
