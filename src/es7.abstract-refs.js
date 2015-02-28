// https://github.com/zenparsing/es-abstract-refs
!function(){
  var REFERENCE_GET = getWellKnownSymbol('referenceGet', true)
    , REFERENCE_SET = getWellKnownSymbol('referenceSet', true)
    , REFERENCE_DELETE = getWellKnownSymbol('referenceDelete', true);
  
  $define(STATIC, 'Symbol', {
    referenceGet: REFERENCE_GET,
    referenceSet: REFERENCE_SET,
    referenceDelete: REFERENCE_DELETE
  });
  
  hidden(FunctionProto, REFERENCE_GET, returnThis);
  
  function setMapMethods(Constructor){
    if(Constructor){
      var MapProto = Constructor.prototype;
      hidden(MapProto, REFERENCE_GET, MapProto.get);
      hidden(MapProto, REFERENCE_SET, MapProto.set);
      hidden(MapProto, REFERENCE_DELETE, MapProto['delete']);
    }
  }
  setMapMethods(core.Map || global.Map);
  setMapMethods(core.WeakMap || global.WeakMap);
}();