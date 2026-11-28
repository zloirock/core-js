import "core-js/modules/es.string.at";
class Holder {
  constructor(input: number[]);
  constructor(input: string);
  constructor(input: number[] | string) {}
}
function first(value: ConstructorParameters<typeof Holder>[0]) {
  return value.at(0);
}
export const result = first("hello");