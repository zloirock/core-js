// A possibly undefined argument does not prove the non-nullable overload.
declare function read(value: string): number[];
declare function read(value: string | undefined): string;
export function last(value: string | undefined) {
  return read(value).at(-1);
}
