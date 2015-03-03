require! './config': {banner}, fs: {readFile}
modules  = <[
  $.global
  $.uid
  $
  $.assert
  $.wks
  $.cof
  $.invoke
  $.partial
  $.assign
  $.keyof
  $.export
  $.iterators
  $.replacer
  $.array-methods
  $.array-includes
  $.string-at
  $.task
  $.species
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

$-iterators = <[
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
module.exports = (options, blacklist, next)-> let @ = options.turn ((memo, it)-> memo[it] = on), {}
  if @shim         => @ <<< {+\shim.old, +\shim.modern}
  if @\shim.old    => for <[es5 web.timers]> => @[..] = on
  if @\shim.modern => for <[es6 es7 js.array.statics web.immediate web.dom.itarable]> => @[..] = on
  if @exp          => for exp => @[..] = on
  for ns of @
    if @[ns]
      for name in modules
        if name.startsWith("#ns.") and name not in exp
          @[name] = on
  for ns in blacklist
    for name in modules
      if name is ns or name.startsWith("#ns.")
        @[name] = no
  @$ = on
  <[global assert uid export wks cof string-at array-methods array-includes replacer assign keyof invoke partial species]>forEach !~> @"$.#it" = on
  if @library            => @ <<< {-\es6.object.prototype, -\es6.function, -\es6.regexp, -\es6.number.constructor, -\core.iterator}
  if @\core.iterator     => @\es6.collections = on
  if @\es6.collections   => @\es6.iterators   = on
  if @\es7.abstract-refs => @\es6.symbol      = on
  if @\core.delay        => @\es6.promise     = on
  if @\web.immediate     => @\$.task     = on
  if @\es6.promise       => @ <<< {+\$.task, +\es6.iterators}
  for $-iterators => if @[..] => @\$.iterators = on
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
    !function(framework, undefined){
    'use strict';
    #{scripts * '\n'}
    }(#{!@library});
    """