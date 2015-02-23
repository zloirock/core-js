require! './config': {banner}, fs: {readFile}
modules  = <[
  common
  common.export
  common.iterators
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
  web.immediate
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
  web.dom.itarable
  web.timers
  core.log
]>

common-iterators = <[
  core.$for
  core.dict
  core.iterator
  core.number
  es6.array.statics
  es6.collections
  es6.iterators
  es6.promise
  es6.reflect
  web.dom.itarable
]>

exp = <[
  core.iterator
]>

x78 = '*'repeat 78
module.exports = (opt, next)-> let @ = opt
  if @shim         => @ <<< {+\shim.old, +\shim.modern}
  if @\shim.old    => for <[es5 web.timers]> => @[..] = on
  if @\shim.modern => for <[es6 es7 js.array.statics web.immediate web.dom.itarable]> => @[..] = on
  if @exp          => for exp => @[..] = on
  for ns of @
    if @[ns]
      for name in modules
        if name.indexOf("#ns.") is 0 and name not in exp
          @[name] = on
  @common = @\common.export = on
  if @library            => @ <<< {-\es6.object.prototype, -\es6.function, -\es6.regexp, -\es6.number.constructor, -\core.iterator}
  if @\core.iterator     => @\es6.collections = on
  if @\es6.collections   => @\es6.iterators   = on
  if @\es7.abstract-refs => @\es6.symbol      = on
  if @\core.delay        => @\es6.promise     = on
  if @\es6.promise       => @ <<< {+\web.immediate, +\es6.iterators}
  for common-iterators => if @[..] => @\common.iterators = on
  scripts = [] <~ Promise.all modules.filter(~> @[it]).map (name)->
    resolve, reject <- new Promise _
    error, data <- readFile "src/#name.js"
    if error => reject error else resolve {name, data}
  .then _, console.error
  scripts .= map ({name, data})-> """
    \n/#x78
     * Module : #name #{' 'repeat 65 - name.length}*
     #x78/\n
    #data
    """
  next """
    #banner
    !function(global, framework, undefined){
    'use strict';
    #{scripts * '\n'}
    }(typeof self != 'undefined' && self.Math === Math ? self : Function('return this')(), #{!@library});
    """