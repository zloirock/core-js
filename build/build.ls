require! './config': {banner}, fs: {readFile}
modules  = <[common es5 global es6_symbol es6 immediate es6_promise es6_collections
            es6_reflect es7 es7_refs dict dict_exp $for iterator timers delay
            binding object array array_statics number string date console]>
old_shim = <[es5 timers console]>
new_shim = <[es6 es6_collections es6_promise es6_symbol es6_reflect es7 es7_refs
            global immediate array_statics]>
exp  = <[iterator delay dict_exp]>
core = <[$for dict binding object array number string date]>
x78  = '*'repeat 78
module.exports = (opt, next)-> let @ = opt
  @common = on
  if @old_shim => for old_shim => @[..] = on
  if @new_shim => for new_shim => @[..] = on
  if @core     => for core     => @[..] = on
  if @exp      => for exp      => @[..] = on
  if @delay    => @es6_promise = on
  if @dict_exp => @dict = no
  if @es6_promise => @ <<< {+immediate, +es6}
  if @es7_refs    => @es6_symbol = on
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