// delete o[k] removes a dynamic computed-key property that may be the tracked field, so the o.x
// narrow bails and .at stays generic (Array|String)
const o = { x: [1, 2, 3] };
delete o[k];
o.x.at(-1);
