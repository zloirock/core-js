var $      = require('./$')
  , cof    = require('./$.cof')
  , RegExp = $.g.RegExp
  , Base   = RegExp
  , proto  = RegExp.prototype;
function regExpBroken() {
  try {
    var a = /a/g;
    // "new" creates a new object
    if (a === new RegExp(a)) { return true; }
    // RegExp allows a regex with flags as the pattern
    return RegExp(/a/g, 'i') != '/a/i';
  } catch(e) {
    return true;
  }
}
if($.FW && $.DESC){
  if(regExpBroken()) {
    RegExp = function RegExp(pattern, flags){
      return new Base(cof(pattern) == 'RegExp' ? pattern.source : pattern,
        flags === undefined ? pattern.flags : flags);
    };
    $.each.call($.getNames(Base), function(key){
      key in RegExp || $.setDesc(RegExp, key, {
        configurable: true,
        get: function(){ return Base[key]; },
        set: function(it){ Base[key] = it; }
      });
    });
    proto.constructor = RegExp;
    RegExp.prototype = proto;
    $.hide($.g, 'RegExp', RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}
require('./$.species')(RegExp);