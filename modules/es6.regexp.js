var $        = require('./$')
  , cof      = require('./$.cof')
  , redef    = require('./$.redef')
  , wks      = require('./$.wks')
  , hide     = $.hide
  , $RegExp  = $.g.RegExp
  , Base     = $RegExp
  , proto    = $RegExp.prototype
  , sproto   = String.prototype
  , $match   = sproto.match
  , $replace = sproto.replace
  , $search  = sproto.search
  , $split   = sproto.split
  , MATCH    = wks('match')
  , REPLACE  = wks('replace')
  , SEARCH   = wks('search')
  , SPLIT    = wks('split')
  , re       = /a/g
  // "new" creates a new object
  , CORRECT_NEW = new $RegExp(re) !== re
  // RegExp allows a regex with flags as the pattern
  , ALLOWS_RE_WITH_FLAGS = function(){
    try {
      return $RegExp(re, 'i') == '/a/i';
    } catch(e){ /* empty */ }
  }();

if($.DESC){
  if(!CORRECT_NEW || !ALLOWS_RE_WITH_FLAGS){
    $RegExp = function RegExp(pattern, flags){
      var patternIsRegExp  = cof(pattern) == 'RegExp'
        , flagsIsUndefined = flags === undefined;
      if(!(this instanceof $RegExp) && patternIsRegExp && flagsIsUndefined)return pattern;
      return CORRECT_NEW
        ? new Base(patternIsRegExp && !flagsIsUndefined ? pattern.source : pattern, flags)
        : new Base(patternIsRegExp ? pattern.source : pattern
          , patternIsRegExp && flagsIsUndefined ? pattern.flags : flags);
    };
    $.each.call($.getNames(Base), function(key){
      key in $RegExp || $.setDesc($RegExp, key, {
        configurable: true,
        get: function(){ return Base[key]; },
        set: function(it){ Base[key] = it; }
      });
    });
    proto.constructor = $RegExp;
    $RegExp.prototype = proto;
    require('./$.redef')($.g, 'RegExp', $RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}

require('./$.species')($RegExp);

function needFix(KEY){
  try {
    var O = {};
    O[wks(KEY)] = function(){ return 7; };
    return ''[KEY](O) != 7;
  } catch(e){
    return true;
  }
}

if(needFix('match')){
  // 21.1.3.11 String.prototype.match(regexp)
  redef(sproto, 'match', function match(regexp){
    var str = String(this)
      , fn  = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, str) : new RegExp(regexp)[MATCH](str);
  });
  // 21.2.5.6 RegExp.prototype[@@match](string)
  hide(proto, MATCH, function(string){
    return $match.call(string, this);
  });
}

if(needFix('replace')){
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  redef(sproto, 'replace', function replace(searchValue, replaceValue){
    var str = String(this)
      , fn  = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, str, replaceValue)
      : $replace.call(str, searchValue, replaceValue);
  });
  // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
  hide(proto, REPLACE, function(string, replaceValue){
    return $replace.call(string, this, replaceValue);
  });
}

if(needFix('split')){
  // 21.1.3.17 String.prototype.split(separator, limit)
  redef(sproto, 'split', function split(separator, limit){
    var str = String(this)
      , fn  = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, str, limit) : $split.call(str, separator, limit);
  });
  // 21.2.5.11 RegExp.prototype[@@split](string, limit)
  hide(proto, SPLIT, function(string, limit){
    return $split.call(string, this, limit);
  });
}

if(needFix('search')){
  // 21.1.3.15 String.prototype.search(regexp)
  redef(sproto, 'search', function search(regexp){
    var str = String(this)
      , fn  = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, str) : new RegExp(regexp)[SEARCH](str);
  });
  // 21.2.5.9 RegExp.prototype[@@search](string)
  hide(proto, SEARCH, function(string){
    return $search.call(string, this);
  });
}