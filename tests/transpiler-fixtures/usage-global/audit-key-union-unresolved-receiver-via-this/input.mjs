let thisKey = 'try';
if (c) thisKey = 'withResolvers';
class P extends Promise {
  static viaThisUnion() {
    return this[thisKey];
  }
}
export const viaThis = P.viaThisUnion();
