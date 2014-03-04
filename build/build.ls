{banner}   = require './config'
{readFile} = require \fs
modules    = <[init framework library es5 resume global immediateInternal es6 es6c promise symbol reflect extendedObjectAPI timers immediate function binding object array arrayStatics number string date extendCollections console]>
required   = <[init resume]>
module.exports = (opt, next)-> let @ = opt
  import {+global, +es5, +timers, +node} if @all
  import {+\function, +binding, +object, +array, +arrayStatics, +number, +string, +date, +es6, +es6c, +promise, +symbol, +reflect, +extendedObjectAPI, +extendCollections, +immediate, +console} if @node
  import if @library => {-framework} else {-library, +framework}
  import {+es6} if @reflect
  @immediateInternal = on if @immediate or @promise
  include = modules.filter ~> it in required or @[it]
  scripts = [] <- Promise.all include.map (module)->
    resolve, reject <- new Promise _
    error, file <- readFile "src/#module.js"
    if error => reject error else resolve file
  .then _, console.error
  scripts .= map (script, key)-> """
    /**
     * Module : #{include[key]}
     */
    #script
    """
  next """
    #banner
    !function(global, undefined){
    'use strict';
    #{scripts * '\n'}
    }(typeof window != 'undefined' ? window : global);
    """