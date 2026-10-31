export function genuineProtoValue() {
  const target = {
    __proto__: undefined
  };
  return target.copyWithin(0);
}