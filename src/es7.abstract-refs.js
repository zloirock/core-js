// https://github.com/zenparsing/es-abstract-refs
!function(){
  var REFERENCE_GET = wks('referenceGet')
    , REFERENCE_SET = wks('referenceSet')
    , REFERENCE_DELETE = wks('referenceDelete');
  
  $def(STATIC, 'Symbol', {
    referenceGet: REFERENCE_GET,
    referenceSet: REFERENCE_SET,
    referenceDelete: REFERENCE_DELETE
  });
  
  $.hide(Function.prototype, REFERENCE_GET, $.that);
  
  function setMapMethods(Constructor){
    if(Constructor){
      var MapProto = Constructor.prototype;
      $.hide(MapProto, REFERENCE_GET, MapProto.get);
      $.hide(MapProto, REFERENCE_SET, MapProto.set);
      $.hide(MapProto, REFERENCE_DELETE, MapProto['delete']);
    }
  }
  setMapMethods($.core.Map || $.g.Map);
  setMapMethods($.core.WeakMap || $.g.WeakMap);
}();