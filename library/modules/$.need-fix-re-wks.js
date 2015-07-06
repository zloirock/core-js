var wks = require('./$.wks');
module.exports = function(KEY){
  try {
    var O = {};
    O[wks(KEY)] = function(){ return 7; };
    return ''[KEY](O) != 7;
  } catch(e){
    return true;
  }
};