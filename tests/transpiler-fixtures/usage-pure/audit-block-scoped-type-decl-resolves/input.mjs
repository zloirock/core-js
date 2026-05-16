// Block-scoped type alias inside a BlockStatement scope. the scope-chain walker must
// detect that `block.body` is already a statement array and use it directly (rather
// than drill once via `block.body?.body` which yields undefined for BlockStatement /
// TSModuleBlock / StaticBlock owners). without the fix, LocalArr is not found, x falls
// through to generic dispatch and `.at(0)` emits the broader receiver helper instead
// of the Array-specific one.
function probe() {
  {
    type LocalArr = number[];
    declare const x: LocalArr;
    x.at(0);
  }
}
