function fn(x) {
  if (x instanceof globalThis.Array) x.at(0);
  if (x instanceof window.Array) x.at(0);
  if (x instanceof self.Array) x.at(0);
  if (x instanceof global.Array) x.at(0);
}
