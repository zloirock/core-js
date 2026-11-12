// The optional call returns the constructor; await inside it remains lowerable.
export async function read(arr) { return new (arr.at?.(await 0))(7); }
