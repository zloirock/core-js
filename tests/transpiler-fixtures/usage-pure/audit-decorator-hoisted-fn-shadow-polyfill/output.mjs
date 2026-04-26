// decorated class where a hoisted local function shadows a polyfillable name: the
// shadowed reference resolves to the local, polyfill emission for that name skips.
class A {
  @dec(function () {
    function Array() {
      return {
        from: () => 1
      };
    }
    return Array.from([1]);
  })
  m() {}
}