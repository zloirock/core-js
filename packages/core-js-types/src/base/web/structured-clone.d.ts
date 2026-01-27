interface CoreJSStructuredSerializeOptions { // @type-options: no-extends, no-prefix
  readonly __brand?: unique symbol;

  transfer?: any[];
}

/**
 * Creates a deep clone of a given value using the structured clone algorithm.
 * @param value - The value to be cloned.
 * @param options - An optional object that may contain a transfer property,
 * which is an array of transferable objects to be transferred rather than cloned.
 * @returns A deep clone of the provided value.
 */
declare function structuredClone<T = any>(value: T, options?: CoreJSStructuredSerializeOptions): T;
