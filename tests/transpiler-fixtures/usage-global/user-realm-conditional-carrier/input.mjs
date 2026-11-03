// A user conditional is evaluated once even when its live name looks global.
export function read(self, test) {
  const { at, includes } = test() ? void 0 : self;
  return [at, includes];
}
