// The optional reader can take the fallback. Its ordinary twin throws before it.
export const { from: optional } = (globalThis.window?.self)?.Array ?? {};
export const { from: plain } = (globalThis.window?.self).Array ?? {};
