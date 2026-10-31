// a tagged template yields what its tag returns, so a static read off a slot holding one names
// the constructor the tag returns and is served by that static's own entry
function iterator() { return Iterator; }
function promise() { return Promise; }
function url() { return URL; }
const list = [iterator`x`];
export const from = typeof list[0].from;
export const attempted = ({ P: promise`y` }).P.try(() => 1);
const box = { U: url`z` };
export const parses = box.U.canParse('a:b');
