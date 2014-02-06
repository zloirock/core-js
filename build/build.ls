{banner}   = require './config'
{readFile} = require \fs
modules    = <[global init es5 resume immediateInternal es6 es6c promise extendedObjectAPI timers immediate function binding object array arrayStatics number string date extendCollections console]>
required   = <[init resume]>
module.exports = (opt, next)-> let @ = opt
  import {+global, +es5, +timers, +node} if @all
  import {+\function, +binding, +object, +array, +arrayStatics, +number, +string, +date, +es6, +es6c, +promise, +extendedObjectAPI, +extendCollections, +immediate, +console} if @node
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