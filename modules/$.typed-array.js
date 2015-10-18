'use strict';
var DEBUG = true;

var global            = require('./$.global')
  , $def              = require('./$.def')
  , $buffer           = require('./$.buffer')
  , $ArrayBuffer      = $buffer.ArrayBuffer
  , $DataView         = $buffer.DataView
  , $                 = require('./$')
  , setDesc           = $.setDesc
  , getDesc           = $.getDesc
  , ctx               = require('./$.ctx')
  , strictNew         = require('./$.strict-new')
  , propertyDesc      = require('./$.property-desc')
  , $hide             = require('./$.hide')
  , isInteger         = require('./$.is-integer')
  , toInteger         = require('./$.to-integer')
  , toLength          = require('./$.to-length')
  , toIndex           = require('./$.to-index')
  , isObject          = require('./$.is-object')
  , toObject          = require('./$.to-object')
  , isArrayIter       = require('./$.is-array-iter')
  , isIterable        = require('./core.is-iterable')
  , getIterFn         = require('./core.get-iterator-method')
  , wks               = require('./$.wks')
  , arrayMethods      = require('./$.array-methods')
  , arrayIncludes     = require('./$.array-includes')
  , $fill             = require('./$.array-fill')
  , $copyWithin       = require('./$.array-copy-within')
  , $forEach          = arrayMethods(0)
  , $map              = arrayMethods(1)
  , $filter           = arrayMethods(2)
  , $some             = arrayMethods(3)
  , $every            = arrayMethods(4)
  , $find             = arrayMethods(5)
  , $findIndex        = arrayMethods(6)
  , $indexOf          = arrayIncludes(false)
  , $includes         = arrayIncludes(true)
  , $lastIndexOf      = [].lastIndexOf
  , $reduce           = [].reduce
  , $reduceRight      = [].reduceRight
  , $join             = [].join
  , $reverse          = [].reverse
  , $sort             = [].sort
  , $slice            = [].slice
  , $toString         = [].toString
  , $toLocaleString   = [].toLocaleString
  , TYPED_ARRAY       = wks('typed_array')
  , TYPED_CONSTRUCTOR = wks('typed_constructor')
  , BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';

var validate = function(it){
  if(isObject(it) && TYPED_ARRAY in it)return it;
  throw TypeError(it + ' is not a typed array!');
};

var fromList = function(C, list){
  var index  = 0
    , length = list.length
    , result = allocate(C, length);
  while(length > index)result[index] = list[index++];
  return result;
};

var allocate = function(C, length){
  if(!(isObject(C) && TYPED_CONSTRUCTOR in C)){
    throw TypeError('It is not a typed array constructor!');
  } return new C(length);
};

var $from = function from(source /*, mapfn, thisArg */){
  var O       = toObject(source)
    , $$      = arguments
    , $$len   = $$.length
    , mapfn   = $$len > 1 ? $$[1] : undefined
    , mapping = mapfn !== undefined
    , iterFn  = getIterFn(O)
    , i, length, values, result, step, iterator;
  if(iterFn != undefined && !isArrayIter(iterFn)){
    for(iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++){
      values.push(step.value);
    } O = values;
  }
  if(mapping && $$len > 2)mapfn = ctx(mapfn, $$[2], 2);
  for(i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++){
    result[i] = mapping ? mapfn(O[i], i) : O[i];
  }
  return result;
};

var addGetter = function(C, key, internal){
  setDesc(C.prototype, key, {get: function(){ return this._d[internal]; }});
};

var statics = {
  // @@species -> this
  from: $from,
  of: function of(/*...items*/){
    var index  = 0
      , length = arguments.length
      , result = new this(length);
    while(length > index)result[index] = arguments[index++];
    return result;
  }
};

var proto = {
  // get length
  // constructor
  copyWithin: function copyWithin(target, start /*, end */){
    return $copyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
  },
  every: function every(callbackfn /*, thisArg */){
    return $every(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  },
  fill: function fill(value /*, start, end */){ // eslint-disable-line no-unused-vars
    return $fill.apply(validate(this), arguments);
  },
  filter: function filter(callbackfn /*, thisArg */){
    return fromList(this.constructor, $filter(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined));
  },
  find: function find(predicate /*, thisArg */){
    return $find(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
  },
  findIndex: function findIndex(predicate /*, thisArg */){
    return $findIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
  },
  forEach: function forEach(callbackfn /*, thisArg */){
    $forEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  },
  indexOf: function indexOf(searchElement /*, fromIndex */){
    return $indexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
  },
  includes: function includes(searchElement /*, fromIndex */){
    return $includes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
  },
  join: function join(separator){ // eslint-disable-line no-unused-vars
    return $join.apply(validate(this), arguments);
  },
  lastIndexOf: function lastIndexOf(searchElement /*, fromIndex */){ // eslint-disable-line no-unused-vars
    return $lastIndexOf.apply(validate(this), arguments);
  },
  map: function map(mapfn /*, thisArg */){
    return fromList(this.constructor, $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined));
  },
  reduce: function reduce(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
    return $reduce.apply(validate(this), arguments);
  },
  reduceRight: function reduceRight(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
    return $reduceRight.apply(validate(this), arguments);
  },
  reverse: function reverse(){
    return $reverse.call(validate(this));
  },
  set: function set(arrayLike /*, offset */){
    validate(this);
    var offset = toInteger(arguments.length > 1 ? arguments[1] : undefined);
    if(offset < 0)throw RangeError();
    var length = this.length;
    var src    = toObject(arrayLike);
    var index  = 0;
    var len    = toLength(src.length);
    if(len + offset > length)throw RangeError();
    while(index < len)this[offset + index] = src[index++];
  },
  slice: function slice(start, end){
    return fromList(this.constructor, $slice.call(validate(this), start, end)); // TODO
  },
  some: function some(callbackfn /*, thisArg */){
    return $some(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  },
  sort: function sort(comparefn){
    return $sort.call(validate(this), comparefn);
  },
  subarray: function subarray(/* begin, end */){
    var O      = validate(this)
      , length = O.length
      , $$     = arguments
      , $$len  = $$.length
      , begin  = toIndex($$len > 0 ? $$[0] : undefined, length)
      , end    = $$len > 1 ? $$[1] : undefined;
    return new O.constructor( // <- TODO SpeciesConstructor
      O.buffer,
      O.byteOffset + begin * O.BYTES_PER_ELEMENT,
      toLength((end === undefined ? length : toIndex(end, length)) - begin)
    );
  },
  toLocaleString: function toLocaleString(){
    return $toLocaleString.apply(validate(this), arguments);
  },
  toString: function toString(){
    return $toString.call(this);
  },
  entries: function entries(){
    // looks like Array equal + ValidateTypedArray
  },
  keys: function keys(){
    // looks like Array equal + ValidateTypedArray
  },
  values: function values(){
    // looks like Array equal + ValidateTypedArray
  }
  // @@iterator
};

var isTADesc = function(target, key){
  return isObject(target) && TYPED_ARRAY in target
    && (typeof key == 'string' || typeof key == 'number') && isInteger(+key); // <- use toPrimitive
};
var $getDesc = $.getDesc = function getOwnPropertyDescriptor(target, key){
  return isTADesc(target, key) ? propertyDesc(2, target[key]) : getDesc(target, key);
};
var $setDesc = $.setDesc = function defineProperty(target, key, desc){
  if(isTADesc(target, key) && isObject(desc)){
    if('value' in desc)target[key] = desc.value;
    return target;
  } else return setDesc(target, key, desc);
};

DEBUG && $def($def.S + $def.F * DEBUG, 'Object', {
  getOwnPropertyDescriptor: $getDesc,
  defineProperty: $setDesc
});

DEBUG && ('Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,' +
'Uint32Array,Float32Array,Float64Array').split(',').forEach(function(it){
  delete global[it];
});

module.exports = function(KEY, BYTES, wrapper, CLAMPED){
  CLAMPED = !!CLAMPED;
  var NAME        = KEY + (CLAMPED ? 'Clamped' : '') + 'Array'
    , GETTER      = 'get' + KEY
    , SETTER      = 'set' + KEY
    , $TypedArray = global[NAME]
    , Base        = $TypedArray
    , O           = {};
  var addElement = function(that, index){
    setDesc(that, index, {
      get: function(){
        var data = this._d;
        return data.v[GETTER](index * BYTES + data.o);
      },
      set: function(it){
        var data = this._d;
        if(CLAMPED)it = (it = Math.round(it)) < 0 ? 0 : it > 0xff ? 0xff : it & 0xff;
        data.v[SETTER](index * BYTES + data.o, it);
      },
      enumerable: true
    });
  };
  if(!$ArrayBuffer)return;
  if(!$TypedArray || !$buffer.useNative){
    $TypedArray = wrapper(function(that, data, $offset, $length){
      strictNew(that, $TypedArray, NAME);
      var index  = 0
        , offset = 0
        , buffer, byteLength, length;
      if(!isObject(data)){
        byteLength = toInteger(data) * BYTES;
        buffer = new $ArrayBuffer(byteLength);
      // TODO TA case
      } else if(data instanceof $ArrayBuffer){
        buffer = data;
        offset = toInteger($offset);
        if(offset < 0 || offset % BYTES)throw RangeError();
        var $len = data.byteLength;
        if($length === undefined){
          if($len % BYTES)throw RangeError();
          byteLength = $len - offset;
          if(byteLength < 0)throw RangeError();
        } else {
          byteLength = toLength($length) * BYTES;
          if(byteLength + offset > $len)throw RangeError();
        }
      } else return $from.call($TypedArray, data);
      length = byteLength / BYTES;
      $hide(that, '_d', {
        b: buffer,
        o: offset,
        l: byteLength,
        e: length,
        v: new $DataView(buffer)
      });
      while(index < length)addElement(that, index++);
    });
    addGetter($TypedArray, 'buffer', 'b');
    addGetter($TypedArray, 'byteOffset', 'o');
    addGetter($TypedArray, 'byteLength', 'l');
    addGetter($TypedArray, 'length', 'e');
    $hide($TypedArray, BYTES_PER_ELEMENT, BYTES);
    $hide($TypedArray.prototype, BYTES_PER_ELEMENT, BYTES);
  } else if(!require('./$.iter-detect')(function(iter){
    new $TypedArray(iter); // eslint-disable-line no-new
  }, true)){
    $TypedArray = wrapper(function(that, data, $offset, $length){
      strictNew(that, $TypedArray, NAME);
      if(isObject(data) && isIterable(data))return $from.call($TypedArray, data);
      return new $TypedArray(data, $offset, $length);
    });
    $TypedArray.prototype = Base.prototype;
  }
  $hide($TypedArray, TYPED_CONSTRUCTOR, true);
  $hide($TypedArray.prototype, TYPED_ARRAY, true);
  DEBUG && require('./$.mix')($TypedArray.prototype, proto);
  DEBUG && require('./$.mix')($TypedArray, statics);
  O[NAME] = $TypedArray;
  $def($def.G + $def.F * ($TypedArray != Base), O);
};