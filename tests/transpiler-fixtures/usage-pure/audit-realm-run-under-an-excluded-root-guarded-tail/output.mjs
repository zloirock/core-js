import _self from "@core-js/pure/actual/self";
export const deleteRun = delete _self.window;
// ... and a `?.` over such a run guards nothing once the run rides the span pure CAN back: the read
// lands an always-defined binding, so the guard erases with the hops it was reading - whichever hop
// of the run the source wrote it on
export const guardedTail = _self.window?.customProp;