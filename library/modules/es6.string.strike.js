'use strict';
// B.2.3.12 String.prototype.strike()
require('./$.string-html')('strike', function(createHTML){
  return function strike(){
    return createHTML(this, 'strike', '', '');
  }
});