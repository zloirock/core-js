// The stripped-realm control supplies the scheduler before loading this usage-pure bundle.
export function run() {
  globalThis.scheduleRejection(() => {
    Promise.reject(new Error('queued pure rejection'));
  });
  return { checks: [{ label: 'completed', pass: true }] };
}
