version='0.0.1'
require! fs
read=(name,opt=no,next)->
  if &length<3 => next=opt
  if opt => fs.readFile "src/#{name}.js",{encoding:'utf8'},(,d)->next "// module #{name}\n"+d
  else next ''
module.exports=(opt,next)->let @=opt
  if @all => import {+global,+shim,+timers,+node}
  if @node => import {+\function,+object,+array,+number,+string,+iz,+regexp,+date,+es6,+es6c,+events,+console,+ls}
  scripts=[';!function(global,Function,Object,Array,String,Number,RegExp,Date,Error,TypeError,Math,undefined){']
  scripts[*]<~read \global,@global
  scripts[*]<~read \init
  scripts[*]<~read \iz
  scripts[*]<~read \es5shim,@shim
  scripts[*]<~read \resume
  scripts[*]<~read \function
  scripts[*]<~read \objectDesc
  scripts[*]<~read \object
  scripts[*]<~read \array
  scripts[*]<~read \number
  scripts[*]<~read \string
  scripts[*]<~read \regexp
  scripts[*]<~read \es6shim,@es6
  scripts[*]<~read \es6collections,@es6c
  scripts[*]<~read \izExternal,@iz
  scripts[*]<~read \timers,@timers
  scripts[*]<~read \functionExternal,@function
  scripts[*]<~read \objectExternal,@object
  scripts[*]<~read \arrayExternal,@array
  scripts[*]<~read \numberExternal,@number
  scripts[*]<~read \stringExternal,@string
  scripts[*]<~read \regexpExternal,@regexp
  scripts[*]<~read \dateExternal,@date
  scripts[*]<~read \events,@events
  scripts[*]<~read \console,@console
  scripts[*]<~read \ls,@ls
  scripts[*]="}(typeof window!='undefined'?window:global,Function,Object,Array,String,Number,RegExp,Date,Error,TypeError,Math);"
  script=scripts * '\n'
  if @min => script = require \uglify-js .minify script,{+fromString,compress:{+unsafe}} .code
  next """// Core.js #version
          // http://core.zloirock.ru
          // © 2013 Denis Pushkarev
          // Available under MIT license
          #script"""