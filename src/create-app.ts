import { validateDirectory } from "./utils/validate-directory";
import { isWriteable } from "./utils/fs";
import * as logger from "./utils/logger";
import path from "path";
import { isOnline } from "./utils/is-online";
import picocolors from "picocolors";
import fs from "fs-extra";
import retry from "async-retry";
import { downloadAndExtractRepo } from "./utils/github";

export async function createApp({
  directory,
  framework,
}: {
  directory: string;
  framework: "next" | "react";
}): Promise<void> {
  const online = await isOnline();
  if (!online) {
    logger.error("You are not online. Please check your internet connection.");
    process.exit(1);
  }

  const { valid, root, error } = validateDirectory(directory);
  const relativeProjectDir = path.relative(process.cwd(), root);
  const projectDirIsCurrentDir = relativeProjectDir === "";

  if (!valid) {
    logger.error(error);
    process.exit(1);
  }

  console.log(`Create a new Update app in ${directory}\n`);

  if (!(await isWriteable(path.dirname(root)))) {
    logger.error(
      "The application path is not writable, please check folder permissions and try again."
    );
    logger.error(
      "It is likely you do not have write permissions for this folder."
    );
    process.exit(1);
  }

  try {
    await fs.mkdir(root, { recursive: true });
  } catch (err) {
    logger.error("Unable to create project directory");
    logger.error(err);
    process.exit(1);
  }

  const loader = logger.loader(
    "Downloading files... (This might take a moment)"
  );

  loader.start();
  await retry(() => downloadAndExtractRepo(root, framework), {
    retries: 3,
  });
  loader.succeed();

  if (projectDirIsCurrentDir) {
    logger.log(
      `${picocolors.bold(
        ">>> Success!"
      )} Your new Update app is ready in the ${picocolors.green(
        "app"
      )} directory.`
    );
  } else {
    logger.log(
      `${picocolors.bold(
        ">>> Success!"
      )} Created your Update app at ${picocolors.green(
        path.join(relativeProjectDir)
      )}`
    );
  }

  const packageJsonPath = path.join(root, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = path.basename(root);
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}
