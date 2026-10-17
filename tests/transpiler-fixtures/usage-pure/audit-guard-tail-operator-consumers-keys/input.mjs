export const keys = [];
for (const key in globalThis.window?.self.Object.fromEntries([['a', 1]])) keys.push(key);
