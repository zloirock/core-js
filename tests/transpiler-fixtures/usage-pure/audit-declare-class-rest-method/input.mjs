// `declare class { m(...args) }` parses with the class method value as an overload
// signature. Without rest-param neutralization the scope crawler throws. Unrelated
// string binding below confirms the file-level transform completes
declare class C {
  m(...args: number[]): void;
}
declare const s: string;
s.at(-1);
