// proposal stage: 3
// https://github.com/tc39/proposal-json-parse-with-source
type RawJSONObject = {
  rawJSON: string;
}
interface JSON {
  isRawJSON(value: unknown): value is RawJSONObject;
  rawJSON(value: string): RawJSONObject;
}
