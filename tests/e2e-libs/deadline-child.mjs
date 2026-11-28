// Keep the caller's IPC channel on an event loop the exercise cannot block.
import { execFile, fork } from 'node:child_process';
import { promisify } from 'node:util';
import { ps } from 'zx';

// On POSIX a process group survives the exercise process and can still be stopped.
const windows = process.platform === 'win32';
const execFileAsync = promisify(execFile);
const launchedAt = Date.now();
const child = fork(new URL('./deadline-exercise.mjs', import.meta.url), {
  detached: !windows,
  execArgv: [],
  stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
});

function killPid(pid) {
  try {
    process.kill(pid, 'SIGKILL');
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}

async function stopWindowsTree(pid) {
  try {
    await execFileAsync('taskkill.exe', ['/pid', String(pid), '/t', '/f'], { windowsHide: true });
    return true;
  } catch (error) {
    try {
      process.kill(pid, 0);
    } catch (probeError) {
      if (probeError.code === 'ESRCH') return false;
    }
    throw error;
  }
}

async function stopExercise() {
  if (!child.pid) return;
  const running = child.exitCode === null && child.signalCode === null;
  try {
    if (windows) {
      if (running && await stopWindowsTree(child.pid)) return;
      // Windows retains creator PIDs after exit. Keep the links in case a
      // branch root disappears between this snapshot and taskkill.
      const { stdout } = await execFileAsync('powershell.exe', [
        '-NoProfile', '-NonInteractive', '-Command',
        "$ErrorActionPreference = 'Stop'; Get-CimInstance Win32_Process | Where-Object { $_.CreationDate }"
          + " | ForEach-Object { '{0} {1} {2}' -f $_.ParentProcessId, $_.ProcessId, ([DateTimeOffset]$_.CreationDate).ToUnixTimeMilliseconds() }",
      ], { windowsHide: true });
      const children = new Map();
      let rootReplacement = Infinity;
      for (const line of stdout.trim().split(/\r?\n/u)) {
        const [parent, pid, createdAt] = line.trim().split(/\s+/u).map(Number);
        if (!pid || !(createdAt >= launchedAt)) continue;
        // The original root is gone. This row, if present, belongs to a new process.
        if (pid === child.pid) {
          rootReplacement = createdAt;
          continue;
        }
        if (!children.has(parent)) children.set(parent, []);
        children.get(parent).push({ pid, createdAt });
      }
      const visited = new Set([child.pid]);
      async function stopBranches(parent, parentCreatedAt) {
        await Promise.all((children.get(parent) || []).map(async ({ pid, createdAt }) => {
          // A creator PID may have been reused. An older child cannot belong to a newer parent.
          if (visited.has(pid) || createdAt < parentCreatedAt || (parent === child.pid && createdAt >= rootReplacement)) return;
          visited.add(pid);
          if (!await stopWindowsTree(pid)) await stopBranches(pid, createdAt);
        }));
      }
      await stopBranches(child.pid, launchedAt);
    } else {
      try {
        // A detached descendant leaves the process group. Find it while its parent lives.
        if (running) {
          const descendants = await ps.tree({ pid: child.pid, recursive: true });
          for (const descendant of descendants.reverse()) killPid(Number(descendant.pid));
        }
      } finally {
        // The group can still exist after its leader has exited.
        killPid(-child.pid);
      }
    }
  } catch (error) {
    process.exitCode = 1;
    console.error(`could not stop the exercise process tree: ${ error.message }`);
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  }
}

let stopping;
function stop() {
  return stopping ??= stopExercise();
}

process.once('disconnect', stop);
process.once('message', request => { if (child.connected) child.send(request); });
child.on('message', reply => { if (process.connected) process.send(reply, () => { /* The caller can disconnect before the relay completes. */ }); });
function reportEnd(message) {
  // Report the exercise failure before tree cleanup can consume its remaining deadline.
  if (process.connected) process.send(message, () => {
    if (process.connected) process.disconnect();
  });
  return stop();
}
child.once('error', error => reportEnd({
  type: 'e2e-libs:spawn-error',
  message: error.message, code: error.code, path: error.path, syscall: error.syscall,
}));
child.on('exit', (code, signal) => {
  return reportEnd({ type: 'e2e-libs:exit', code, signal });
});
