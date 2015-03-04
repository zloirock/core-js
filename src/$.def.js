var $      = require('./$')
  , global = $.g
  , core   = $.core;
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
if($.framework)global.core = core;
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , target   = isGlobal ? global : (type & $def.S)
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // there is a similar native
    own = !(type & $def.F) && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // prevent global pollution for namespaces
    if(!$.framework && isGlobal && !$.isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = $.ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && !$.framework && target[key] == out){
      exp = function(param){
        return this instanceof out ? new out(param) : out(param);
      }
      exp.prototype = out.prototype;
    } else exp = type & $def.P && $.isFunction(out) ? $.ctx(Function.call, out) : out;
    // extend global
    if($.framework && target && !own){
      if(isGlobal)target[key] = out;
      else delete target[key] && $.hide(target, key, out);
    }
    // export
    if(exports[key] != out)$.hide(exports, key, exp);
  }
}
module.exports = $def;