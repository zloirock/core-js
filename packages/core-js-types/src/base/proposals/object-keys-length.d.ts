// https://github.com/tc39/proposal-object-keys-length

interface ObjectConstructor {
  /**
   * Returns the number of enumerable own properties of an object
   * @param o - Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  keysLength(o: {}): number;
}
