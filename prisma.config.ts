import path from "node:path";
import { defineConfig } from "prisma/config";

import "dotenv/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrate: {
    async adapter() {
      const { Pool } = await import("pg");
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const pool = new Pool({
        connectionString: process.env.DIRECT_URL,
      });
      return new PrismaPg(pool);
    },
  },
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
