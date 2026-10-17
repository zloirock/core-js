// Both builtin prototype families contribute includes, without unrelated iterator methods.
export function read(flag) {
  const { prototype: { includes } } = flag ? Array : String;
  return includes.call([4], '4');
}
export const result = [read(true), read(false)];
