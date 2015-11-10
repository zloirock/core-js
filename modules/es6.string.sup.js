'use strict';
// B.2.3.14 String.prototype.sup()
require('./$.string-html')('sup', function(createHTML){
  return function sup(){
    return createHTML(this, 'sup', '', '');
  }
});