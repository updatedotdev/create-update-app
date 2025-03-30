import { Stream } from "node:stream";
import { promisify } from "node:util";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createWriteStream, promises as fs } from "node:fs";
import { x as extract } from "tar";
import got from "got";

const pipeline = promisify(Stream.pipeline);

export interface RepoInfo {
  username: string;
  name: string;
  branch: string;
  filePath: string;
}

async function downloadTar(url: string, name: string) {
  const tempFile = join(tmpdir(), `${name}.temp-${Date.now()}`);
  await pipeline(got.stream(url), createWriteStream(tempFile));
  return tempFile;
}

export async function downloadAndExtractRepo(root: string, name: string) {
  const tempFile = await downloadTar(
    `https://codeload.github.com/updatedotdev/examples/tar.gz/main`,
    name
  );

  await extract({
    file: tempFile,
    cwd: root,
    strip: 2,
    filter: path =>
      !path.endsWith("package-lock.json") &&
      !path.endsWith("yarn.lock") &&
      !path.endsWith("pnpm-lock.yaml") &&
      !path.endsWith("bun.lockb"),
  });

  await fs.unlink(tempFile);
}
