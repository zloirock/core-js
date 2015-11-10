'use strict';
// B.2.3.9 String.prototype.italics()
require('./$.string-html')('italics', function(createHTML){
  return function italics(size){
    return createHTML(this, 'i', '', '');
  }
});