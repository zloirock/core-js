// A non-null assertion restores the primitive overload after the nullable guard.
declare function read(value: string): number[];
declare function read(value: string | undefined): string;
export function last(value: string | undefined) { return read(value!).at(-1); }
