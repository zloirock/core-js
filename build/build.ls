{banner}   = require './config'
{readFile} = require \fs
modules = <[common es5 global es6_symbol es6 immediate es6_promise es6_collections es6_iterators dict timers
            binding object array array_statics number string regexp date console]>
old_shim = <[es5 timers]>
new_shim = <[es6 es6_collections es6_promise es6_symbol es6_iterators global immediate array_statics console]>
core = <[dict binding object array number string regexp date]>
module.exports = (opt, next)-> let @ = opt
  @common = on
  if @old_shim => for old_shim => @[..] = on
  if @new_shim => for new_shim => @[..] = on
  if @core => for core => @[..] = on
  if @es6_promise => @ <<< {+immediate, +es6_iterators}
  if @es6_iterators => @es6_symbol = on
  include = modules.filter ~> @[it]
  scripts = [] <~ Promise.all include.map (module)->
    resolve, reject <- new Promise _
    error, file <- readFile "src/#module.js"
    if error => reject error else resolve file
  .then _, console.error
  scripts .= map (script, key)->
    name = include[key]
    x78  = \* .repeat 78
    """
    \n/#x78
     * Module : #name #{' 'repeat 65 - name.length}*
     #x78/\n
    #script
    """
  next """
    #banner
    !function(returnThis, framework, undefined){
    'use strict';
    #{scripts * '\n'}
    }(Function('return this'), #{!@library});
    """