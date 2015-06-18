var $def   = require('./$.def')
  , create = require('./$').create
  , define = require('./$.object-define');

$def($def.S + $def.F, 'Object', {
  make: function(proto, mixin){
    return define(create(proto), mixin);
  }
});