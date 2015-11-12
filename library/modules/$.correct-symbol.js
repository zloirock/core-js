var global   = require('./$.global')
  , $Symbol  = global.Symbol
  , document = global.document || {}
  , GEBTN    = 'getElementsByTagName';
module.exports = typeof $Symbol == 'function' && (document[GEBTN] === undefined || !require('./$.fails')(function(){
  // Chromium 38-40 Symbol has a bug with some kinds of DOM collections
  var htc = document.createElement('x')[GEBTN]('y')
    , sym = $Symbol();
  htc[sym] = 7;
  return htc[sym] !== 7;
}));