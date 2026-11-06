// A sole nested assignment carries its call root into the dispatch exactly once.
const getBox = () => { log("call"); return { data: [1, 2] }; };
let at;
({ data: { at } } = getBox());
