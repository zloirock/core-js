delete global.Promise;

var Promise = require('../../').Promise;
var assert  = require('assert')

module.exports = {
  deferred: function(){
  	var o = {};
  	o.promise = new Promise(function(resolve,reject){
  		o.resolve = resolve;
  		o.reject  = reject;
  	});
  	return o;
  },
  resolved: function(val){
	  return Promise.resolve(val);
  },
  rejected: function(reason){
	 return Promise.reject(reason);
  },
  defineGlobalPromise: function(global){
    global.Promise = Promise;
    global.assert  = assert;
  },
  removeGlobalPromise: function(){
    delete global.Promise;
  }
};