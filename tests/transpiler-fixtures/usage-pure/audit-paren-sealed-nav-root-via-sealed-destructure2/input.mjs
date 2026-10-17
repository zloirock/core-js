// the probe rides DESTRUCTURE and INSTANCE spellings of the sealed source too: a static
// prop claim carries it in the extracted binding (throw before ANY binding lands), an
// instance receiver renders the guarded nav INSIDE the helper argument
export const { includes: viaSealedDestructure2 } = (globalThis.window?.self.window).Array.prototype;
