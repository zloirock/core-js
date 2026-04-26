// receiver `Array` shadowed by a local binding before the IIFE: rewrite must respect
// scope shadowing and route `from` through the user's wrapper, not the polyfilled global
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