// Static access through a const container alias keeps the Array.from polyfill.
// Reading the declaration type must preserve the member receiver and argument effects.
const first = { owner: Array };
const second = first;
second.owner.from((effect(), [2, 3]));
