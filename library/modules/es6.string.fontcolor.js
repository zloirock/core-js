'use strict';
// B.2.3.7 String.prototype.fontcolor(color)
require('./$.string-html')('fontcolor', function(createHTML){
  return function fontcolor(color){
    return createHTML(this, 'font', 'color', color);
  }
});