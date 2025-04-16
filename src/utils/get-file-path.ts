export function getFilePath(framework: string, auth: string) {
  if (framework === "next") {
    if (auth === "supabase") {
      return "next-supabase";
    }
  }

  if (framework === "react") {
    if (auth === "supabase") {
      return "react-supabase";
    }
  }

  throw new Error("Invalid framework or auth provider");
}
