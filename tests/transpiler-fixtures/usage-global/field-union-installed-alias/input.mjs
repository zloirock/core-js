// An unread body can receive the holder through a different binding.
function change() { this.data = '1020'; }
const box = { data: [10, 20] };
const alias = box;
alias.change = change;
box.change();
export const result = box.data.includes('02');
