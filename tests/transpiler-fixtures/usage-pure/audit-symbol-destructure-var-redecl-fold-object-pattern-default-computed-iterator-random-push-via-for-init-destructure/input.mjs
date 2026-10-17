// a for-init DESTRUCTURE host folds like the block-hosted twin: the per-iteration self-rebind
// estree records for the head's own binding is the declaration, not a reassignment
for (const { iterator: viaForInitDestructure = 0 } = Symbol; Math.random() > 2;) {
  export_.push([][viaForInitDestructure]);
  break;
}
