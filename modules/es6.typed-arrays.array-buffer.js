var $def     = require('./$.def')
  , buffer   = require('./$.buffer')
  , toIndex  = require('./$.to-index')
  , toLength = require('./$.to-length')
  , $ArrayBuffer = buffer.ArrayBuffer
  , $DataView    = buffer.DataView
  , FORCED       = $def.F * !buffer.useNative
  , ARRAY_BUFFER = 'ArrayBuffer';

$def($def.G + $def.W + FORCED, {ArrayBuffer: $ArrayBuffer});

$def($def.S + FORCED, ARRAY_BUFFER, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it){ // eslint-disable-line no-unused-vars

  }
});

$def($def.P + FORCED, ARRAY_BUFFER, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end){
    var len    = this.byteLength
      , first  = toIndex(start, len)
      , final  = toIndex(end === undefined ? len : end, len)
      , result = new $ArrayBuffer(toLength(final - first))
      , viewS  = new $DataView(this)
      , viewT  = new $DataView(result)
      , index  = 0;
    while(first < final){
      viewT.setUint8(index++, viewS.getUint8(first++));
    } return result;
  }
});