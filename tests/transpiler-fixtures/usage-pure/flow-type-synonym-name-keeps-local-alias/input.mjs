// Flow aliases use their declared bodies before built-in synonym normalization.
// This String body requires String instance dispatch.
type Thenable<T> = string;
export function read(value: Thenable<number>) { return value.at(0); }
