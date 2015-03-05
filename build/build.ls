require! {'./config': {banner}, fs: {readFile, writeFile, unlink}, browserify, '../library': core}
{startsWith, repeat} = core.String
list = <[
  $.library
  es5
  es6.symbol
  es6.object.statics
  es6.object.prototype
  es6.object.statics-accept-primitives
  es6.function
  es6.number.constructor
  es6.number.statics
  es6.math
  es6.string
  es6.array.statics
  es6.array.prototype
  core.iterator
  es6.iterators
  es6.regexp
  es6.promise
  es6.collections
  es6.reflect
  es7.proposals
  es7.abstract-refs
  core.dict
  core.$for
  core.delay
  core.binding
  core.object
  core.array
  core.number
  core.string
  core.date
  core.global
  js.array.statics
  web.immediate
  web.dom.itarable
  web.timers
  core.log
]>

exp = <[
  core.iterator
]>

x78 = repeat '*' 78
module.exports = ({modules, blacklist, library}, next)-> let @ = core.Array.turn modules, ((memo, it)-> memo[it] = on), {}
  if @exp => for exp => @[..] = on
  for ns of @
    if @[ns]
      for name in list
        if startsWith(name, "#ns.") and name not in exp
          @[name] = on
  for ns in blacklist
    for name in list
      if name is ns or startsWith name, "#ns."
        @[name] = no
  if library  => @ <<< {+\$.library, -\es6.object.prototype, -\es6.function, -\es6.regexp, -\es6.number.constructor, -\core.iterator}
  err <-! writeFile './__tmp__.js', list.filter(~> @[it]).map(->"require('./src/#it');").join '\n'
  if err => console.error err
  err, script <-! browserify(['./__tmp__']).bundle
  if err => console.error err
  err <-! unlink './__tmp__.js'
  if err => console.error err
  next """
    #banner
    !function(undefined){
    var __e = null, __g = null;
    
    #script
    // CommonJS export
    if(typeof module != 'undefined' && module.exports)module.exports = __e;
    // RequireJS export
    else if(typeof define == 'function' && define.amd)define(function(){return __e});
    // Export to global object
    else __g.core = __e;
    }();
    """