// proposal stage: 3
// https://github.com/tc39/proposal-json-parse-with-source
interface CoreJSReviverContext {
  readonly __brand: unique symbol;
  source: string;
}

interface CoreJSRawJSON {
  readonly __brand: unique symbol;
  rawJSON: string;
}

interface JSON {
  isRawJSON(value: any): value is CoreJSRawJSON;
  parse<T = any>(text: string, reviver?: (key: string, value: any, context: CoreJSReviverContext) => any): T;
  rawJSON(value: string): CoreJSRawJSON;
}
