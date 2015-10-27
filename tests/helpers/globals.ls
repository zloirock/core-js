'use strict'
global = Function('return this')!
global <<< do
  global: global
  DESCRIPTORS: (-> try 7 is Object.defineProperty({}, \a, get: -> 7)a)!
  STRICT: !(-> @)!
  PROTO: Object.setPrototypeOf? or \__proto__ of Object::
  NATIVE: void