// proposal stage: 3
// https://github.com/tc39/proposal-json-parse-with-source
interface ReviverContext {
  source: string;
  keys: string[];
}

type RawJSONObject = {
  rawJSON: string;
}

interface JSON {
  isRawJSON(value: unknown): value is RawJSONObject;
  parse<T = any>(text: string, reviver?: (key: string, value: any, context: ReviverContext) => any): T;
  rawJSON(value: string): RawJSONObject;
}
