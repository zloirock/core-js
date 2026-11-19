// Both keys disappear, but their initializer reads the prefix before either binding.
export const { from, of } = (prefix(), (globalThis.window?.self).Array);
