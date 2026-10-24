// An exported computed static key runs the key effect once over its known receiver and exports the
// pure static binding. The generated initializer remains a valid export declaration.
export const { [(effectful(), 'from')]: f } = Array;
