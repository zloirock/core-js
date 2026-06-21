// IIFE body has a SwitchStatement before the tail return. cases may early-return Map or
// Set; tail returns Array. receiver resolution must bail on SwitchStatement - nested
// ReturnStatements inside SwitchCase consequent are NOT visible to the top-level scan,
// only the tail. outer call stays raw to preserve runtime branching
const out = (() => { switch (kind) { case 'a': return Map; case 'b': return Set; } return Array; })().from([1]);
export { out };
