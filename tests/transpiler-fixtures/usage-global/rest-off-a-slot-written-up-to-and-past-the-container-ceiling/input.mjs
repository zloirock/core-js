// A member write through a binding lands in every container the binding may hold: up to 64 containers it is
// filed under each of them, past that once for all, and a read of that slot through any container finds it
// either way. Each rest below reads a constructor out of such a slot through another literal and pulls the
// family written there - on both sides of the ceiling, each side under a key of its own.
let laidOut, filedOnce;
// 64 containers, eight rows of eight
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
// 65 containers: the same eight rows and one more
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {};
laidOut.ctor = Map;
filedOnce.slot = Promise;
const viaLaidOut = { held: laidOut }, viaFiledOnce = { held: filedOnce };
const { groupBy, ...mapRest } = viaLaidOut.held.ctor;
const { withResolvers, ...promiseRest } = viaFiledOnce.held.slot;
export const r = [groupBy, mapRest, withResolvers, promiseRest];
