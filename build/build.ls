{banner}   = require './config'
{readFile} = require \fs
modules = <[core es5 global es6_symbol es6 immediate es6_promise es6_collections
            es6_iterators dict timers function deferred binding object array
            array_statics number string regexp date collections console]>
module.exports = (opt, next)-> let @ = opt
  @core = on
  import {+global, +es5, +timers, +node} if @all
  import {+\function, +deferred, +binding, +object, +array, +array_statics
        , +number, +string, +regexp, +date, +es6, +es6_collections, +es6_promise
        , +es6_symbol, +es6_iterators, +dict, +immediate, +console
  } if @node
  import {+es6_iterators, +es6_collections} if @collections
  import {+es6_collections, +es6_symbol} if @es6_iterators
  import {+immediate, +es6_iterators} if @es6_promise
  import {+es6_iterators} if @dict
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
    
    // Node.js export
    if(NODE)module.exports = core;
    // Export to global object
    if(!NODE || framework)$define(GLOBAL, {core: core});
    }(Function('return this'), #{!@library});
    """