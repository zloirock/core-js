// A logical write can retain a foreign object with its own self and items.
export const first = (options.root ||= globalThis).self?.items.at(0);
export const last = (options.root ??= globalThis)?.self.items.at(-1);
