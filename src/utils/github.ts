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

// export async function downloadAndExtractRepo(
//   root: string,
//   { username, name, branch, filePath }: RepoInfo
// ) {
//   const tempFile = await downloadTar(
//     `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`,
//     `turbo-ct-example`
//   );

//   let rootPath: string | null = null;
//   await extract({
//     file: tempFile,
//     cwd: root,
//     strip: filePath ? filePath.split("/").length + 1 : 1,
//     filter: (p: string) => {
//       // Determine the unpacked root path dynamically instead of hardcoding to the fetched repo's name. This avoids the condition when the repository has been renamed, and the
//       // old repository name is used to fetch the example. The tar download will work as it is redirected automatically, but the root directory of the extracted
//       // example will be the new, renamed name instead of the name used to fetch the example.
//       if (rootPath === null) {
//         const pathSegments = p.split("/");
//         rootPath = pathSegments.length ? pathSegments[0] : null;
//       }
//       return p.startsWith(`${rootPath}${filePath ? `/${filePath}/` : "/"}`);
//     },
//   });

//   await fs.unlink(tempFile);
// }

export async function downloadAndExtractRepo(
  root: string,
  { username, name, branch, filePath }: RepoInfo
) {
  const tempFile = await downloadTar(
    `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`,
    name
  );

  let rootPath: string | null = null;
  await extract({
    file: tempFile,
    cwd: root,
    strip: filePath ? filePath.split("/").length + 1 : 1,
    filter: (p: string) => {
      // Determine the unpacked root path dynamically.
      if (rootPath === null) {
        const pathSegments = p.split("/");
        rootPath = pathSegments.length ? pathSegments[0] : null;
        if (!rootPath) {
          // Should not happen with valid tarballs, but handle defensively.
          return false;
        }
      }

      // Filter based on the dynamic root path and optional filePath.
      const targetPath = `${rootPath}${filePath ? `/${filePath}` : ""}/`;
      if (!p.startsWith(targetPath)) {
        return false;
      }

      // Also filter out lock files.
      return (
        !p.endsWith("package-lock.json") &&
        !p.endsWith("yarn.lock") &&
        !p.endsWith("pnpm-lock.yaml") &&
        !p.endsWith("bun.lockb")
      );
    },
  });

  await fs.unlink(tempFile);
}
