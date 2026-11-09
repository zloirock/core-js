// An optional constructor element keeps its native rejection and its static namespace.
for (const { resolve } of [globalThis.window?.Promise]) use(resolve);
