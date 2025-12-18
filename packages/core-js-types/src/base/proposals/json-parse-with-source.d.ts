// https://github.com/tc39/proposal-json-parse-with-source

interface CoreJSReviverContext { // @type-options no-extends,no-prefix
  readonly __brand: unique symbol;

  source: string;
}

interface CoreJSRawJSON { // @type-options no-extends,no-prefix
  readonly __brand: unique symbol;

  rawJSON: string;
}

interface JSON {  // @type-options no-constructor
  /**
   * Determines whether a value is a RawJSON object.
   * @param value
   */
  isRawJSON(value: any): value is CoreJSRawJSON;

  /**
   * Parses a JSON string, allowing the reviver function to access
   * the exact source text and position of each parsed value.
   * @param text The JSON string to parse.
   * @param reviver A function that transforms the results. It is called for each member of the object.
   * The function receives three arguments: the key, the value, and a context object
   * containing the source text and position.
   * @returns Parsed JavaScript value.
   */
  parse<T = any>(text: string, reviver?: (key: string, value: any, context: CoreJSReviverContext) => any): T;

  /**
   * Creates a RawJSON object from a JSON string.
   * @param value
   */
  rawJSON(value: string): CoreJSRawJSON;
}
