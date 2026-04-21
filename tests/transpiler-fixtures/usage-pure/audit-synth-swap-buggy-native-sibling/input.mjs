function f({ resolve, custom } = Promise) {
  return [resolve(1), custom];
}
globalThis.__call = () => f({ resolve: x => x, custom: 'ok' });
