// Replacing a source name leaves its previously captured array or string intact.
let array = [1];
const [savedArray] = [array];
array = '02';
savedArray.at;
let string = '02';
const [savedString] = [string];
string = [1];
savedString.includes;
