var $ = require('./$');
module.exports = function(C){
  if($.DESC && $.framework)$.setDesc(C, require('./$.wks')('species'), {
    configurable: true,
    get: $.that
  });
}