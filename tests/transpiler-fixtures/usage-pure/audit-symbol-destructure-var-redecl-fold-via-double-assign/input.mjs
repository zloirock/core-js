// a REPEATED aliasing write is no registered alias - the pristine-tree judgment refuses the
// multi-write set - while the write reaching the read still names the key, so the read takes
// the iterator method on both emitters
let twice;
({ iterator: twice } = Symbol);
({ iterator: twice } = Symbol);
export const viaDoubleAssign = [][twice];
