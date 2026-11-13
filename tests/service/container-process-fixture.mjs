import { startContainer } from '../../packages/core-js-service-container/index.js';

process.on('SIGINT', () => process.send('shutdown received'));
await startContainer({
  createService() {
    if (process.env.CONTAINER_PLAN_FAILURE) throw new Error('fixture plan failure');
    return {
      start() { return { ready: Promise.resolve(), warmed: Promise.resolve({ failed: [] }) }; },
      async serveScript(request, response) {
        if (process.env.CONTAINER_REQUEST_FAILURE) {
          if (process.env.CONTAINER_REQUEST_FAILURE === 'after_headers') response.write('incomplete');
          throw new Error('fixture script failed');
        }
        process.send('accepted');
        await new Promise(resolve => process.once('message', resolve));
        response.end('accepted request completed');
      },
    };
  },
});
