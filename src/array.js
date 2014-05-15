$define(PROTO, ARRAY, {
  /**
   * Alternatives:
   * http://sugarjs.com/api/Array/at
   * With Proxy: http://www.h3manth.com/new/blog/2013/negative-array-index-in-javascript/
   */
  get: function(index){
    index = toInteger(index);
    return ES5Object(this)[0 > index ? this.length + index : index];
  },
  /**
   * Alternatives:
   * http://lodash.com/docs#template
   */
  transform: transform,
  // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  contains: function(value){
    var O      = ES5Object(this)
      , length = O.length
      , i      = 0;
    while(length > i)if(same0(value, O[i++]))return true;
    return false;
  }
});