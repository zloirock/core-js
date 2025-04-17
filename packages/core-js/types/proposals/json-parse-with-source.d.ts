// proposal stage: 3
// https://github.com/tc39/proposal-json-parse-with-source
interface JSON {
  isRawJSON(value: unknown): value is string;
}
