import prompts from "prompts";
import { createApp } from "./create-app";
import * as logger from "./utils/logger";
import picocolors from "picocolors";

interface PromptState {
  aborted: boolean;
}

const onState = (state: PromptState) => {
  if (state.aborted) {
    console.log(picocolors.yellow("\nOperation cancelled."));
    process.exit(1);
  }
};

export async function create(directory: string | undefined) {
  if (directory == null) {
    const answers = await prompts({
      type: "text",
      name: "projectDirectory",
      message: "Where would you like to create your Update app?",
      initial: "my-app",
      onState,
    });
    directory = answers.projectDirectory as string;
  }

  const { framework } = await prompts([
    {
      type: "select",
      name: "framework",
      message: "Which framework would you like to use?",
      choices: [
        {
          title: "Next.js",
          value: "next",
        },
        {
          title: "React + Vite",
          value: "react",
        },
      ],
      onState,
    },
  ]);

  await createApp({
    directory,
    framework,
  });

  logger.log("\nNext steps:\n");
  logger.log(`cd ${directory}`);
  logger.log("npm install");
  logger.log("npm run dev\n");
}
