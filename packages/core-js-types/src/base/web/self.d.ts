declare global {
  var self: typeof globalThis extends { onmessage: any; self: infer T } ? T : {
    URL?: typeof URL;
  };
}

export {};
