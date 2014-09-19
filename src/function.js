$define(PROTO, FUNCTION, {
  construct: construct,
  invoke: function(args, that){
    return invoke(this, args, that);
  }
});