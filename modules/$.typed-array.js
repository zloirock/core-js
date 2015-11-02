'use strict';
var DEBUG = false;

var DESCRIPTORS        = require('./$.descriptors')
  , global             = require('./$.global')
  , LIBRARY            = require('./$.library')
  , $                  = require('./$')
  , fails              = require('./$.fails')
  , $def               = require('./$.def')
  , $buffer            = require('./$.buffer')
  , ctx                = require('./$.ctx')
  , strictNew          = require('./$.strict-new')
  , propertyDesc       = require('./$.property-desc')
  , $hide              = require('./$.hide')
  , isInteger          = require('./$.is-integer')
  , toInteger          = require('./$.to-integer')
  , toLength           = require('./$.to-length')
  , toIndex            = require('./$.to-index')
  , toPrimitive        = require('./$.to-primitive')
  , isObject           = require('./$.is-object')
  , toObject           = require('./$.to-object')
  , isArrayIter        = require('./$.is-array-iter')
  , isIterable         = require('./core.is-iterable')
  , getIterFn          = require('./core.get-iterator-method')
  , wks                = require('./$.wks')
  , arrayMethods       = require('./$.array-methods')
  , arrayIncludes      = require('./$.array-includes')
  , $fill              = require('./$.array-fill')
  , $copyWithin        = require('./$.array-copy-within')
  , speciesConstructor = require('./$.species-constructor')
  , $iterators         = require('./es6.array.iterator')
  , Iterators          = require('./$.iterators')
  , $iterDetect        = require('./$.iter-detect')
  , setSpecies         = require('./$.set-species')
  , $ArrayBuffer       = $buffer.ArrayBuffer
  , $DataView          = $buffer.DataView
  , setDesc            = $.setDesc
  , getDesc            = $.getDesc
  , $forEach           = arrayMethods(0)
  , $map               = arrayMethods(1)
  , $filter            = arrayMethods(2)
  , $some              = arrayMethods(3)
  , $every             = arrayMethods(4)
  , $find              = arrayMethods(5)
  , $findIndex         = arrayMethods(6)
  , $indexOf           = arrayIncludes(false)
  , $includes          = arrayIncludes(true)
  , $values            = $iterators.values
  , $keys              = $iterators.keys
  , $entries           = $iterators.entries
  , $lastIndexOf       = [].lastIndexOf
  , $reduce            = [].reduce
  , $reduceRight       = [].reduceRight
  , $join              = [].join
  , $reverse           = [].reverse
  , $sort              = [].sort
  , $slice             = [].slice
  , $toString          = [].toString
  , _toLocaleString    = [].toLocaleString
  , ITERATOR           = wks('iterator')
  , TAG                = wks('toStringTag')
  , TYPED_ARRAY        = wks('typed_array')
  , TYPED_CONSTRUCTOR  = wks('typed_constructor')
  , DEF_CONSTRUCTOR    = wks('def_constructor')
  , BYTES_PER_ELEMENT  = 'BYTES_PER_ELEMENT';

var ARRAY_NAMES = ('Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,' +
  'Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array').split(',');

DEBUG && ARRAY_NAMES.forEach(function(it){
  delete global[it];
});

var ALL_ARRAYS = $every(ARRAY_NAMES, function(key){
  return global[key];
});

var validate = function(it){
  if(isObject(it) && TYPED_ARRAY in it)return it;
  throw TypeError(it + ' is not a typed array!');
};

var fromList = function(O, list){
  var index  = 0
    , length = list.length
    , result = allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
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

var $of = function of(/*...items*/){
  var index  = 0
    , length = arguments.length
    , result = allocate(this, length);
  while(length > index)result[index] = arguments[index++];
  return result;
};
var $toLocaleString = function toLocaleString(){
  return _toLocaleString.apply(validate(this), arguments);
};

var proto = {
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
    return fromList(this, $filter(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined)); // TODO
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
    return fromList(this, $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined)); // TODO
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
    return fromList(this, $slice.call(validate(this), start, end)); // TODO
  },
  some: function some(callbackfn /*, thisArg */){
    return $some(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  },
  sort: function sort(comparefn){
    return $sort.call(validate(this), comparefn);
  },
  subarray: function subarray(begin, end){
    var O      = validate(this)
      , length = O.length
      , $begin = toIndex(begin, length);
    return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
      O.buffer,
      O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
      toLength((end === undefined ? length : toIndex(end, length)) - $begin)
    );
  },
  entries: function entries(){
    return $entries.call(validate(this));
  },
  keys: function keys(){
    return $keys.call(validate(this));
  },
  values: function values(){
    return $values.call(validate(this));
  }
};

var isTADesc = function(target, key){
  return isObject(target) && TYPED_ARRAY in target && isInteger(+key);
};
var $getDesc = function getOwnPropertyDescriptor(target, key){
  return isTADesc(target, key = toPrimitive(key, true))
    ? propertyDesc(2, target[key])
    : getDesc(target, key);
};
var $setDesc = function defineProperty(target, key, desc){
  if(isTADesc(target, key = toPrimitive(key, true)) && isObject(desc)){
    if('value' in desc)target[key] = desc.value;
    return target;
  } else return setDesc(target, key, desc);
};

if(DESCRIPTORS && !ALL_ARRAYS){
  $.getDesc = $getDesc;
  $.setDesc = $setDesc;
}

$def($def.S + $def.F * (DESCRIPTORS && !ALL_ARRAYS), 'Object', {
  getOwnPropertyDescriptor: $getDesc,
  defineProperty: $setDesc
});

module.exports = function(KEY, BYTES, wrapper, CLAMPED){
  if(!DESCRIPTORS)return;
  CLAMPED = !!CLAMPED;
  var NAME        = KEY + (CLAMPED ? 'Clamped' : '') + 'Array'
    , GETTER      = 'get' + KEY
    , SETTER      = 'set' + KEY
    , $TypedArray = global[NAME]
    , Base        = $TypedArray || {}
    , FORCED      = !$TypedArray || !$buffer.useNative
    , $iterator   = proto.values
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
  if(FORCED){
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
  } else if(!$iterDetect(function(iter){
    new $TypedArray(iter); // eslint-disable-line no-new
  }, true)){
    $TypedArray = wrapper(function(that, data, $offset, $length){
      strictNew(that, $TypedArray, NAME);
      if(isObject(data) && isIterable(data))return $from.call($TypedArray, data);
      return $length === undefined ? new Base(data, $offset) : new Base(data, $offset, $length);
    });
    $TypedArray.prototype = Base.prototype;
    if(!LIBRARY)$TypedArray.prototype.constructor = $TypedArray;
  }
  var $TypedArrayPrototype = $TypedArray.prototype;
  var $nativeIterator = $TypedArrayPrototype[ITERATOR];
  $hide($TypedArray, TYPED_CONSTRUCTOR, true);
  $hide($TypedArrayPrototype, TYPED_ARRAY, NAME);
  $hide($TypedArrayPrototype, DEF_CONSTRUCTOR, $TypedArray);
  TAG in $TypedArrayPrototype || $.setDesc($TypedArrayPrototype, TAG, {
    get: function(){ return NAME; }
  });

  O[NAME] = $TypedArray;

  $def($def.G + $def.W + $def.F * ($TypedArray != Base), O);

  $def($def.S + $def.F * ($TypedArray != Base), NAME, {
    BYTES_PER_ELEMENT: BYTES,
    from: Base.from || $from,
    of: Base.of || $of
  });

  $def($def.P + $def.F * FORCED, NAME, proto);

  $def($def.P + $def.F * ($TypedArrayPrototype.toString != $toString), NAME, {toString: $toString});

  $def($def.P + $def.F * fails(function(){
    return [1, 2].toLocaleString() != new Typed([1, 2]).toLocaleString()
  }), NAME, {toLocaleString: $toLocaleString});
  
  Iterators[NAME] = $nativeIterator || $iterator;
  LIBRARY || $nativeIterator || $hide($TypedArrayPrototype, ITERATOR, $iterator);
  
  setSpecies(NAME);
};