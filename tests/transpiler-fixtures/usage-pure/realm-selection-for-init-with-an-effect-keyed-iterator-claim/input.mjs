// An iterator claim keyed by an effect beside a plain slot, in a for-init over a realm selection: both legs
// run the key's effect first and bind the claim after the slot, babel reading the realm again for each part
// while unplugin's drain memoizes it (the sidecar).
for (const { [(e(), Symbol.iterator)]: it, z } = c ? globalThis : self; ;) break;
