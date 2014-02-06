var tieExt = {tie: tie};
extendBuiltInObject($Array, tieExt);
extendBuiltInObject(RegExp[prototype], tieExt);
extendBuiltInObject($Function, tieExt);
extendBuiltInObject(Object, {
  /**
   * Alternatives:
   * http://lodash.com/docs#bindKey
   */
  tie: unbind(tie),
  /**
   * Alternatives:
   * http://www.2ality.com/2013/06/auto-binding.html
   */
  useTie: part.call(extendBuiltInObject, $Object, tieExt)
});