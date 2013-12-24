modules  = <[global init stringInt es5 resume functionInt objectInt arrayInt numberInt regexpInt es6 es6c timers function object wrap array arrayStatics number string regexp date async console]>
optional = <[global es5 es6 es6c timers function object wrap array arrayStatics number string regexp date async console]>
closure  = 'global, Function, Object, Array, String, Number, RegExp, Date, TypeError, Math, isFinite'
require! <[fs ./config]>
module.exports = (opt, next)-> let @ = opt
  import {+global, +es5, +timers, +node} if @all
  import {+\function, +object, +wrap, +array, +arrayStatics, +number, +string, +regexp, +date, +es6, +es6c, +events, +async, +console} if @node
  include = modules.filter ~> it not in optional or @[it]
  error, scripts = [] <~ include
    .map -> "src/#it.js"
    .asyncMap fs.readFile, _
  scripts .= map (script, key)->
    """
    // Module : #{include[key]}
    #script
    """
  next \
    """
    #{config.banner}
    !function(#closure, undefined){
    'use strict';
    #{scripts * '\n'}
    }(typeof window != 'undefined' ? window : #closure);
    """