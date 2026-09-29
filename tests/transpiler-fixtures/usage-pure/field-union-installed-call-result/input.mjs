// A returned function is an unread replacement for an existing method.
function make() { return function () { this.data = '1020'; }; }
class Box { data = [10, 20]; change() {} }
const box = new Box();
box.change = make();
box.change();
export const result = box.data.includes('02');
