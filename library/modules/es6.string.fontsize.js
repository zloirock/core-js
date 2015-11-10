'use strict';
// B.2.3.8 String.prototype.fontsize(size)
require('./$.string-html')('fontsize', function(createHTML){
  return function fontsize(size){
    return createHTML(this, 'font', 'size', size);
  }
});