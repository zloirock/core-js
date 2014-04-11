{banner}   = require './config'
{readFile} = require \fs
modules    = <[ core es5 global es6 es6_collections es6_promise es6_symbol
                es6_iterators dict timers immediate function deferred binding
                object array array_statics number string regexp date collections
                console ]>
module.exports = (opt, next)-> let @ = opt
  @core = on
  import {+global, +es5, +timers, +node} if @all
  import {+\function, +deferred, +binding, +object, +array, +array_statics
        , +number, +string, +regexp, +date, +es6, +es6_collections, +es6_promise
        , +es6_symbol, +es6_iterators, +dict, +collections, +immediate, +console
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
  scripts .= map (script, key)-> """
    /*****************************
     * Module : #{include[key]}
     *****************************/\n
    #script
    """
  next """
    #banner
    !function(global, framework, undefined){
    'use strict';
    #{scripts * '\n\n'}
    }(typeof window != 'undefined' ? window : global, #{!@library});
    """