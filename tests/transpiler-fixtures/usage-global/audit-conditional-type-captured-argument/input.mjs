// Only the captured value argument flows into the result. Its Set needs annotation
// injection, while the surrounding Map comparison and the unused Number capture do not.
declare const value: Map<string, Set<number>> extends Map<string, infer Captured> ? Captured : never;
declare const unused: Number extends infer Captured ? string : boolean;
export { value, unused };
