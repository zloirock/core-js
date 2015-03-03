!function(NAME, FunctionProto){
  // 19.2.4.2 name
  NAME in FunctionProto || ($.DESC && $.setDesc(FunctionProto, NAME, {
    configurable: true,
    get: function(){
      var match = String(this).match(/^\s*function ([^ (]*)/)
        , name  = match ? match[1] : '';
      $.has(this, NAME) || $.setDesc(this, NAME, $.desc(5, name));
      return name;
    },
    set: function(value){
      $.has(this, NAME) || $.setDesc(this, NAME, $.desc(0, value));
    }
  }));
}('name', Function.prototype);