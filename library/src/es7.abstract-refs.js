// https://github.com/zenparsing/es-abstract-refs
var $                = require('./$')
  , wks              = require('./$.wks')
  , $def             = require('./$.def')
  , REFERENCE_GET    = wks('referenceGet')
  , REFERENCE_SET    = wks('referenceSet')
  , REFERENCE_DELETE = wks('referenceDelete')
  , hide             = $.hide;

$def($def.S, 'Symbol', {
  referenceGet:    REFERENCE_GET,
  referenceSet:    REFERENCE_SET,
  referenceDelete: REFERENCE_DELETE
});

hide(Function.prototype, REFERENCE_GET, $.that);

function setMapMethods(Constructor){
  if(Constructor){
    var MapProto = Constructor.prototype;
    hide(MapProto, REFERENCE_GET,    MapProto.get);
    hide(MapProto, REFERENCE_SET,    MapProto.set);
    hide(MapProto, REFERENCE_DELETE, MapProto['delete']);
 }
}
setMapMethods($.core.Map || $.g.Map);
setMapMethods($.core.WeakMap || $.g.WeakMap);