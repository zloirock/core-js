// The nullish arm remains possible and keeps the optional short circuit.
export function read(flag: boolean) {
  let value: string | undefined;
  if (flag) value = "ab";else value = undefined;
  return value?.at(0);
}
