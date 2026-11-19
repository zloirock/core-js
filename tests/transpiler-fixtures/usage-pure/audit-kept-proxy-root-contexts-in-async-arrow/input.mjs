let r;
export const inAsyncArrow = (async () => (r = globalThis.window)?.self.Array.prototype.some.call([1], it => it))();
