var $ = require('./$');
module.exports = function(it){
  return $.ES5Object($.assertDefined(it));
};