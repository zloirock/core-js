// A namespace exposes only the user's bindings and cannot contain an export list.
const rows: [number[], number[]] = [[3], [7]];
declare const mixed: [number, { at: number }];
export namespace Outer {
  export const [{ at: first }, { at: second }] = rows;
  export namespace Inner {
    export const [index, { at: value }] = mixed;
  }
}
