// sloppy Annex-B (B.3.2): an intervening lexical binding (`let Array`) between the block-level
// function and the script scope BLOCKS the Annex-B var-hoist, so the function stays block-scoped
// and the outside use reads the global - injection is required (a naive hoist check under-injects)
{
  let Array;
  {
    function Array() { return null; }
  }
}
Array.from([1]);
