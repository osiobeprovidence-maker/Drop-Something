import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://securetoken.google.com/dropsomething-d00ca",
      applicationID: "dropsomething-d00ca",
    },
  ],
} satisfies AuthConfig;
