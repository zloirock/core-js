// Receiver `Array` shadowed by a local binding before the IIFE - the synth-swap resolver
// honours scope shadowing and refuses to substitute the local `Array` with a polyfilled
// global. without this safeguard the rewrite would silently route `from` through the
// runtime polyfill instead of the user's wrapper
{
  const Array = MyArrayWrapper;
  function caller({
    from
  }) {
    return from([1, 2, 3]);
  }
  caller(Array);
}
export {};