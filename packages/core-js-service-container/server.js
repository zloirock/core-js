import report from './report.js';

const GET_ONLY = { exposeHeadRoute: false };

export default function createServer({ lifecycle, releases, fastify, log = error => fastify.log.error(error) }) {
  async function serve(script, request, reply) {
    const response = reply.raw;
    if (!script) return reply.header('cache-control', 'no-store').code(404).send();
    const { serveScript } = script;
    if (!serveScript) return reply.header('cache-control', 'no-store').code(503).send();

    reply.hijack();
    try {
      await serveScript(request.raw, response);
    } catch (error) {
      report(() => log(error), 'service container request failed', error);
      if (response.headersSent) {
        response.destroy(error);
      } else {
        for (const name of response.getHeaderNames()) response.removeHeader(name);
        response.statusCode = 500;
        response.setHeader('cache-control', 'no-store');
        response.end();
      }
    }
  }

  if (releases) {
    fastify.get('/status', GET_ONLY, (request, reply) => reply.header('cache-control', 'no-store').send(releases.status()));
    fastify.get('/status/:release', GET_ONLY, (request, reply) => {
      reply.header('cache-control', 'no-store');
      const release = releases.get(request.params.release);
      return release ? reply.send(release.status()) : reply.code(404).send();
    });
    fastify.get('/polyfills/:release.js', GET_ONLY,
      (request, reply) => serve(releases.get(request.params.release), request, reply));
  } else {
    fastify.get('/status', GET_ONLY, () => lifecycle.status());
    fastify.get('/polyfills.js', GET_ONLY, (request, reply) => serve(lifecycle, request, reply));
  }

  return fastify;
}
