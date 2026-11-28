declare function make(value: string): { items: string };
declare function make(value: number): { items: number[] };
type Result = ReturnType<typeof make>['items'];
function read(value: Result) { return value.at(0); }
export const result = read([42]);
