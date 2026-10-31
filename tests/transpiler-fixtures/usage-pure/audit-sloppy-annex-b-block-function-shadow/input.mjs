// sloppy Annex-B (B.3.3): a block-level function declaration hoists a var-binding to the
// enclosing script scope, so the OUTSIDE use reads the user function, not the global -
// no ponyfill substitution (a strict script / module keeps it block-scoped and the
// outside use polyfills as usual)
{
  function Array() { return null; }
}
Array.from([1]);
