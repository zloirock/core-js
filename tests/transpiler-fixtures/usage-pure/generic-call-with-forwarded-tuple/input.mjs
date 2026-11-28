function second<T, U>(a: T, b: U, ...rest: unknown[]): U { return b; }
const xs = ["abc", "def"] as const;
export const result = second(...xs, [7]).at(0);

