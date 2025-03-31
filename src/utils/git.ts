import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

export function isInGitRepository(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch (_) {
    // do nothing
  }
  return false;
}

export function isInMercurialRepository(): boolean {
  try {
    execSync("hg --cwd . root", { stdio: "ignore" });
    return true;
  } catch (_) {
    // do nothing
  }
  return false;
}

export function tryGitInit(root: string, message: string): boolean {
  let didInit = false;
  try {
    if (isInGitRepository() || isInMercurialRepository()) {
      return false;
    }

    execSync("git init", { stdio: "ignore", cwd: root });
    execSync("git add -A", { stdio: "ignore", cwd: root });

    didInit = true;

    execSync("git checkout -b main", { stdio: "ignore", cwd: root });

    gitCommit(message, root);
    return true;
  } catch (err) {
    if (didInit) {
      try {
        rmSync(path.join(root, ".git"), { recursive: true, force: true });
      } catch (_) {
        // do nothing
      }
    }
    return false;
  }
}

function gitCommit(message: string, root: string) {
  execSync(
    `git commit --author="Update <support@update.dev>" -am "${message}"`,
    {
      stdio: "ignore",
      cwd: root,
    }
  );
}
