// `Extract<Array<number>|Array<string>, Array<string>>` must narrow to Array<string>
// by comparing inner types. without inner-aware isAssignableTo, Array<number> would also
// match and the narrowed result would be the union (losing precision)
type Narrowed = Extract<number[] | string[], string[]>;
declare const arr: Narrowed;
const first = arr.at(0);
const has = arr.includes('a');
export { first, has };
