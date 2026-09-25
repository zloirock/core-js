// A computed receiver is evaluated once for its nested instance bindings and surviving siblings.
// An array wrapper captures its element before the nested read. A sequence-prefixed receiver
// carries its prefix into the one read the claim performs; extra receiver evaluations must not be
// introduced.
const { data: { at: withLeafSibling, keys: leafSibling } } = mk();
const { other: plainSibling, data: { at: withHostSibling } } = mk();
const { data: { at: behindPrefix } } = (eff(), mk());
const [{ data: { at: inWrapper } }] = [mk()];
export { withLeafSibling, leafSibling, withHostSibling, plainSibling, behindPrefix, inWrapper };
