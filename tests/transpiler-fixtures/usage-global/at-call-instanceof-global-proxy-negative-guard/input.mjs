function fn(x) {
  if (!(x instanceof globalThis.Array)) x.at(0);
}
