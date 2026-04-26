// `Extract<number[] | string[], string[]>` must narrow to `string[]` by comparing inner
// types, not just outer Array constructor. otherwise the narrowed type would stay as the
// full union and `.at(0)` / `.includes('a')` would lose precision
type Narrowed = Extract<number[] | string[], string[]>;
declare const arr: Narrowed;
const first = arr.at(0);
const has = arr.includes('a');
export { first, has };
