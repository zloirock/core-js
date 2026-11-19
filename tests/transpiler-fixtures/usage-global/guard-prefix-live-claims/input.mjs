// A prefix runs once and its own polyfill claims survive the outer guard render.
export const instance = (effect(), globalThis.window)?.self?.Array.of(8).at(0);
export const prefix = ([2].at(0), globalThis.window)?.self.Array.of(8);
export const sealed = ((effect(), globalThis.window)?.self).Array.of(8);
export const noPrefix = globalThis.window?.self?.Array.of(8).at(0);
