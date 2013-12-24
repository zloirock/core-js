extendBuiltInObject(RegExp[prototype], {
  fn: function(){
    var that = this;
    return function(it){
      return that.test(it)
    }
  },
  getFlag: getRegExpFlags
});