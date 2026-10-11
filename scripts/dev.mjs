import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const commands = [
  ["api", ["run", "dev:api"]],
  ["web", ["run", "dev:web"]],
];

const children = commands.map(([name, args]) => {
  const command = process.platform === "win32" ? "cmd.exe" : npm;
  const commandArgs =
    process.platform === "win32" ? ["/d", "/s", "/c", npm, ...args] : args;

  const child = spawn(command, commandArgs, {
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      process.exitCode = code;
    }
  });

  return child;
});

function stop() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
