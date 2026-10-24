// A claim keyed by an effect beside a nested level, in an unbraced `var` over an object literal: both legs
// read the claim off the slot ahead of the key's effect, as a sole declarator does, babel reading the slot
// again in the residual while unplugin's drain memoizes it (the sidecar).
if (c) var { y: { other: { q }, [(touch(), 'includes')]: inc } } = { y: src };
