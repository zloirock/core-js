'use strict';
// B.2.3.3 String.prototype.big()
require('./$.string-html')('big', function(createHTML){
  return function big(){
    return createHTML(this, 'big', '', '');
  }
});