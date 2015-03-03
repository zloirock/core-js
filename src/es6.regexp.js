$.DESC && !function(RegExp, _RegExp, RegExpProto){
  // RegExp allows a regex with flags as the pattern
  if(!function(){try{return RegExp(/a/g, 'i') == '/a/i'}catch(e){}}()){
    RegExp = function RegExp(pattern, flags){
      return new _RegExp(cof(pattern) == 'RegExp' && flags !== undefined
        ? pattern.source : pattern, flags);
    }
    $.each.call($.getNames(_RegExp), function(key){
      key in RegExp || $.setDesc(RegExp, key, {
        configurable: true,
        get: function(){ return _RegExp[key] },
        set: function(it){ _RegExp[key] = it }
      });
    });
    RegExpProto.constructor = RegExp;
    RegExp.prototype = RegExpProto;
    $.hide($.g, 'RegExp', RegExp);
  }
  
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(RegExpProto, 'flags', {
    configurable: true,
    get: createReplacer(/^.*\/(\w*)$/, '$1')
  });
  
  setSpecies(RegExp);
}(RegExp, RegExp, RegExp.prototype);