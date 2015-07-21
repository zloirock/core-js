var global = typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g != 'undefined')__g = global; // eslint-disable-line no-undef
module.exports = global;