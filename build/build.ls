require! './config': {banner}, fs: {readFile}
modules  = <[
  common
  es5
  es6.symbol
  es6.object
  es6.object.statics-accept-primitives
  es6.function
  es6.number.constructor
  es6.number
  es6.math
  es6.string
  es6.array
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
  web.console
  core.log
]>

es6 = <[
  es6.object
  es6.object.statics-accept-primitives
  es6.function
  es6.number.constructor
  es6.number
  es6.math
  es6.string
  es6.array
  es6.iterators
  es6.regexp
  es6.collections
  es6.promise
  es6.symbol
  es6.reflect
]>
es7 = <[
  es7.proposals
  es7.abstract-refs
]>
web = <[
  web.dom.itarable
  web.timers
  web.immediate
  web.console
]>
shim_old = <[
  es5
  web.timers
  web.console
]>
shim_modern = <[
  es6
  es7
  js.array.statics
  web.immediate
  web.dom.itarable
]>
core = <[
  core.global
  core.$for
  core.delay
  core.dict
  core.binding
  core.array
  core.object
  core.number
  core.string
  core.date
  core.log
]>
exp = <[
  core.iterator
]>
x78 = '*'repeat 78
module.exports = (opt, next)-> let @ = opt
  @common = on
  if @shim               => @ <<< {+\shim.old, +\shim.modern}
  if @\shim.old          => for shim_old    => @[..] = on
  if @\shim.modern       => for shim_modern => @[..] = on
  if @web                => for web         => @[..] = on
  if @core               => for core        => @[..] = on
  if @exp                => for exp         => @[..] = on
  if @es6                => for es6         => @[..] = on
  if @es7                => for es7         => @[..] = on
  if @library            => @ <<< {-\es6.function, -\es6.regexp, -\es6.number.constructor, -\web.console, -\core.iterator}
  if @\core.iterator     => @\es6.collections = on
  if @\es6.collections   => @\es6.iterators   = on
  if @\es7.abstract-refs => @\es6.symbol      = on
  if @\core.delay        => @\es6.promise     = on
  if @\es6.promise       => @ <<< {+\web.immediate, +\es6.iterators}
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