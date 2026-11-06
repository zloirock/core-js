export function shadowedProtoValue() {
  const undefined = Array.prototype;
  const target = { __proto__: undefined };
  return target.toSpliced(0);
}
