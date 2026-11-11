// An unknown inherited key retains the global static family.
class Bag extends Array {}
export function read(key) { return Bag[key]; }
