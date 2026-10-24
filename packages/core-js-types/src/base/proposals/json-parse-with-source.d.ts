// https://github.com/tc39/proposal-json-parse-with-source

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2026.json.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

/**
 * A frozen object containing JSON text for a primitive value, created by `JSON.rawJSON()`.
 */
interface RawJSON {
  readonly __brand: unique symbol;

  readonly rawJSON: string;
}

interface JSON {
  /**
   * Indicates whether the provided value is an object returned by `JSON.rawJSON()`.
   * @param value - The value to test.
   */
  isRawJSON(value: unknown): value is RawJSON;

  /**
   * Converts a JavaScript Object Notation (JSON) string into an object.
   * @param text - A valid JSON string.
   * @param reviver - A function that transforms the results. This function is called for each member of the object.
   * If a member contains nested objects, the nested objects are transformed before the parent object is.
   * The context object has a `source` property when the property is unmodified and its value is primitive.
   * @throws SyntaxError If `text` is not valid JSON.
   */
  parse(text: string, reviver?: (this: any, key: string, value: any, context: { source?: string }) => any): any;

  /**
   * Creates a frozen object containing JSON text for a primitive value.
   * @param text - Valid JSON text representing a string, number, boolean, or null value.
   * @throws SyntaxError If `text` is not valid JSON text for a primitive value.
   */
  rawJSON(text: string): RawJSON;
}
