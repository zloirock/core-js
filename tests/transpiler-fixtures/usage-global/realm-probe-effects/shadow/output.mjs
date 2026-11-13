// A local realm-shaped object keeps its own value.
export function read() {
  const globalThis = {
    window: {
      Promise: {
        resolve: 31
      }
    }
  };
  return globalThis.window.Promise.resolve;
}