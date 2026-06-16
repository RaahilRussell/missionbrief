import { PrismaClient } from "@prisma/client";
import { loadSampleWorkspace } from "../lib/loadWorkspace";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding BrightPath Youth Center demo workspace...");
  const result = await loadSampleWorkspace(prisma);
  console.log(
    `Seeded workspace ${result.workspaceId}: ${result.fileCount} files, ${result.metricCount} metrics extracted.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
