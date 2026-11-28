import _atMaybeString from "@core-js/pure/actual/string/instance/at";
class Holder {
  constructor(input: number[]);
  constructor(input: string);
  constructor(input: number[] | string) {}
}
function first(value: ConstructorParameters<typeof Holder>[0]) {
  return _atMaybeString(value).call(value, 0);
}
export const result = first("hello");