import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// The nullish arm remains possible and keeps the optional short circuit.
export function read(flag: boolean) {
  let value: string | undefined;
  if (flag) value = "ab";else value = undefined;
  return value == null ? void 0 : _atMaybeString(value).call(value, 0);
}