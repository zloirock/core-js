function makeArr() {
  return [1, 2, 3];
}
namespace N {
  function makeArr() {
    return 'x';
  }
}
export const r = makeArr().flat();
