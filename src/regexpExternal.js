extendBuiltInObject(RegExp[prototype],{
  fn:function(){
    var that=this;
    return function(foo){
      return that.test(foo)
    }
  },
  getFlag:function(){
    return getRegExpFlags(this)
  },
  setFlag:function(flags){
    return RegExp(this.source,flags)
  },
  addFlag:function(flags){
    return RegExp(
      this.source,
      unique.call((getRegExpFlags(this)+flags)).join('')
    )
  },
  removeFlag:function(flag){
    return this.setFlag(getRegExpFlags(this).replace(flag,''))
  }
});