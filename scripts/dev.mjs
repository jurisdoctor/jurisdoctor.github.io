import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

const lock = "node_modules/.cache/next-dev.pid";

const running = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

if (existsSync(lock)) {
  const pid = Number(readFileSync(lock, "utf8").trim());
  if (pid && running(pid)) {
    console.error(
      `\n  A dev server for this project is already running (pid ${pid}).\n` +
        `  Starting a second one wipes the first one's chunks and it starts 404ing.\n\n` +
        `  Use the one that's running, or stop it first:  kill ${pid}\n`,
    );
    process.exit(1);
  }
  rmSync(lock, { force: true });
}

mkdirSync(dirname(lock), { recursive: true });
writeFileSync(lock, String(process.pid));

const release = () => rmSync(lock, { force: true });
process.on("exit", release);

const child = spawn("next", ["dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
});

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  release();
  process.exit(signal ? 1 : (code ?? 0));
});
