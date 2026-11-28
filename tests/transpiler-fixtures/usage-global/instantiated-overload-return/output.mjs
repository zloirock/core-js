import "core-js/modules/es.array.at";
function make<T extends string>(value: T): number[];
function make(value: number): string;
function make(value: unknown): number[] | string {
  return typeof value === 'number' ? 'old' : [42];
}
type Result = ReturnType<typeof make<string>>;
function read(value: Result) {
  return value.at(0);
}
export const result = read(make<string>('argument'));