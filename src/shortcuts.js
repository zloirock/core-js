$forEach(array('create,getPrototypeOf,defineProperties,defineProperty,' +
    'getOwnPropertyDescriptor,keys,getOwnPropertyNames'),
  function(key){
    if(!(key in _) && key in Object)_[key] = Object[key];
  }
);