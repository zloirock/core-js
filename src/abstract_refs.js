!function(){
  var referenceGet = Symbol()
    , referenceSet = Symbol()
    , referencDelete = Symbol();
  $define(STATIC, SYMBOL, {
    referenceGet: referenceGet,
    referenceSet: referenceSet,
    referencDelete: referencDelete
  });
  
  function setMapMethods(Constructor){
    if(Constructor){
      var MapProto = Constructor[PROTOTYPE];
      MapProto[referenceGet] || hidden(MapProto, referenceGet, MapProto.get);
      MapProto[referenceSet] || hidden(MapProto, referenceSet, MapProto.set);
      MapProto[referencDelete] || hidden(MapProto, referencDelete, MapProto['delete']);
    }
  }
  setMapMethods(Map);
  setMapMethods(WeakMap);
  
  FunctionProto[referenceGet] || hidden(FunctionProto, referenceGet, returnThis);
  
  if(Dict){
    var dictKeys = getKeys(Dict), i = 0;
    while(i < dictKeys.length)!function(fn){
      function method(){
        for(var args = [this], i = 0; i < arguments.length;)args.push(arguments[i++]);
        return invoke(fn, args);
      }
      fn[referenceGet] = function(that){
        return method;
      }
    }(Dict[dictKeys[i++]]);
  }
}();