interface Object {
  /**
   * Defines a getter function for the specified property on this object.
   * This method is non-standard and deprecated; prefer `Object.defineProperty`.
   * @param prop - The name or symbol of the property.
   * @param getter - A function that will be called whenever the property is read.
   */
  __defineGetter__(prop: PropertyKey, getter: () => any): void;

  /**
   * Defines a setter function for the specified property on this object.
   * This method is non-standard and deprecated; prefer `Object.defineProperty`.
   * @param prop - The name or symbol of the property.
   * @param setter - A function that will be called whenever the property is assigned a value.
   */
  __defineSetter__(prop: PropertyKey, setter: (val: any) => void): void;

  /**
   * Returns the getter function associated with the specified property,
   * or `undefined` if the property has no getter.
   * This method is non-standard and deprecated.
   * @param prop - The name or symbol of the property.
   * @returns The getter function for the property, or `undefined`.
   */
  __lookupGetter__(prop: PropertyKey): (() => any) | undefined;

  /**
   * Returns the setter function associated with the specified property,
   * or `undefined` if the property has no setter.
   * This method is non-standard and deprecated.
   * @param prop - The name or symbol of the property.
   * @returns The setter function for the property, or `undefined`.
   */
  __lookupSetter__(prop: PropertyKey): ((val: any) => void) | undefined;
}
