!function(){
  $def(PROTO + FORCED, 'Array', {
    turn: function(fn, target /* = [] */){
      assert.fn(fn);
      var memo   = target == undefined ? [] : Object(target)
        , O      = $.ES5Object(this)
        , length = $.toLength(O.length)
        , index  = 0;
      while(length > index)if(fn(memo, O[index], index++, this) === false)break;
      return memo;
    }
  });
  var SYMBOL_UNSCOPABLES = wks('unscopables')
  if(framework && SYMBOL_UNSCOPABLES in []){
    [][SYMBOL_UNSCOPABLES].turn = true;
  }
}();