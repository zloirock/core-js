const { self: reentry } = globalThis;
export const l = reentry.Promise.allSettled(items);
