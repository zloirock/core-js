var global = typeof window != 'undefined' && window.Math == Math ? window : Function('return this')();
module.exports = global;
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef