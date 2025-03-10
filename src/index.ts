#!/usr/bin/env node

import { Command } from "commander";
import { create } from "./create";
import picocolors from "picocolors";
import pkg from "../package.json";

const command = new Command();
command.exitOverride();

command
  .name("create-update-app")
  .description("CLI to bootstrap a new Update app")
  .usage(`${picocolors.bold("<project-directory>")} [options]`)
  .version(pkg.version)
  .argument("[project-directory]", "Directory to create the project in")
  .action(create);

command.parseAsync();
