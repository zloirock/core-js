// A TAGGED template substitution is handed raw to the tag function, so an anonymous object inside it
// escapes (`this.data.at` -> generic `_at`). An UNTAGGED template string-coerces its substitution, so an
// object read in place there stays module-local and keeps the narrow (`this.data.includes` ->
// `_includesMaybeArray`).
declare function tag(strings: TemplateStringsArray, ...values: unknown[]): void;
tag`a${[{ data: ["x"], read() { return this.data.at(0); } }]}b`;
const local = `a${[{ data: ["y"], scan() { return this.data.includes("z"); } }][0].scan()}b`;
export { local };
