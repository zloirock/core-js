// UTF-8 BOM at the start of source: usage-global must strip the BOM and emit
// side-effect imports for `Array.from` (and its compat dependencies) without leaking
// the BOM into the output
Array.from(x);
