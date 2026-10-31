// the buried leaf-key side effect survives the whole-swap, re-run ahead of the binding
let e = 0;
function leafKeySe({ try: t, absent } = globalThis.self[(e++, 'Promise')]) { return [t, absent]; }
leafKeySe();
