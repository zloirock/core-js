// An exported computed static key captures its receiver, runs the key effect once, and exports the
// pure static binding. The generated initializer remains a valid export declaration.
export const { [(effectful(), 'from')]: f } = Array;
