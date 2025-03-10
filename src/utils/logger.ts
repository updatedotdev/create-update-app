import { bold as pcBold, green } from "picocolors";
import ora from "ora";

export const loader = (text: string) =>
  ora({
    text,
    spinner: {
      frames: ["   ", ">  ", ">> ", ">>>"],
    },
  });

export const log = (...args: Array<unknown>) => {
  // eslint-disable-next-line no-console -- logger
  console.log(...args);
};

export const success = (...args: Array<unknown>) => {
  // eslint-disable-next-line no-console -- success logger
  console.log(pcBold(green(">>>")), green(args.join(" ")));
};

export const error = (...args: Array<unknown>) => {
  // eslint-disable-next-line no-console -- error logger
  console.error(pcBold(">>>"), args.join(" "));
};
