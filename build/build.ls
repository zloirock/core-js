require! './config': {banner}, fs: {readFile}
modules = <[common es5 global es6_symbol es6 immediate es6_promise es6_collections es6_iterators dict timers
            binding object array array_statics number string regexp date console]>
old_shim = <[es5 timers]>
new_shim = <[es6 es6_collections es6_promise es6_symbol es6_iterators global immediate array_statics console]>
core = <[dict binding object array number string regexp date]>
x78 = '*'repeat 78
module.exports = (opt, next)-> let @ = opt
  @common = on
  if @old_shim => for old_shim => @[..] = on
  if @new_shim => for new_shim => @[..] = on
  if @core => for core => @[..] = on
  if @es6_promise => @ <<< {+immediate, +es6_iterators}
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
    !function(returnThis, framework, undefined){
    'use strict';
    #{scripts * '\n'}
    }(Function('return this'), #{!@library});
    """