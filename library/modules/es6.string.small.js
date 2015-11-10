'use strict';
// B.2.3.11 String.prototype.small()
require('./$.string-html')('small', function(createHTML){
  return function small(){
    return createHTML(this, 'small', '', '');
  }
});