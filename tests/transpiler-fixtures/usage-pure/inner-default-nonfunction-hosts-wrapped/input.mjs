export const wrapped = (() => {
  const [{ Set: WS, 'with-dash': wd, Array: { of: wof } } = globalThis] = [];
  const [{ Array: { of: wonly } } = globalThis] = [];
  return [WS, wd, wof, wonly];
})();
