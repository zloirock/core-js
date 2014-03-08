{banner}   = require './config'
{readFile} = require \fs
modules    = <[init es5 resume global immediateInternal es6 es6c promise symbol reflect iterator extendedObjectAPI timers immediate function binding object array arrayStatics number string date extendCollections console]>
module.exports = (opt, next)-> let @ = opt
  import {+init, +resume}
  import {+global, +es5, +timers, +node} if @all
  import {+\function, +binding, +object, +array, +arrayStatics, +number, +string, +date, +es6, +es6c, +promise, +symbol, +reflect, +iterator, +extendedObjectAPI, +extendCollections, +immediate, +console} if @node
  import {+iterator} if @reflect or @promise
  import {+immediateInternal} if @immediate or @promise
  include = modules.filter ~> @[it]
  scripts = [] <~ Promise.all include.map (module)->
    resolve, reject <- new Promise _
    error, file <- readFile "src/#module.js"
    if error => reject error else resolve file
  .then _, console.error
  scripts .= map (script, key)-> """
    /*****************************
     * Module : #{include[key]}
     *****************************/
    #script
    """
  next """
    #banner
    !function(global, framework, undefined){
    'use strict';
    #{scripts * '\n'}
    }(typeof window != 'undefined' ? window : global, #{!@library});
    """