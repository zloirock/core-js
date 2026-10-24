import _Set from "@core-js/pure/actual/set/constructor";
// a block-scoped ctor alias serves only its block: the same-named read AFTER the block is a
// runtime ReferenceError the registration must not narrow; a hoisted `var` twin serves the
// whole function
{
  let BlockScoped = _Set;
  export_.inBlock = BlockScoped.union;
}