function viaFn(x) {
  switch (x) {
    case 1:
      function WeakSet() {}
      return WeakSet;
  }
  return new WeakSet([]);
}
export { viaFn };
