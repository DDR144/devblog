import { prisma } from "@/lib/db";

export default async function SmokePage() {
  let dbStatus: string;
  let dbTime: string;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const elapsed = Date.now() - start;
    dbStatus = "connected";
    dbTime = `${elapsed}ms`;
  } catch (e) {
    dbStatus = "disconnected";
    dbTime = "N/A";
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Smoke Test</h1>

      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h2 className="font-semibold mb-2">Tailwind CSS</h2>
          <p className="text-muted-foreground">
            If this text is styled and the border is visible, Tailwind v4 is
            working.
          </p>
          <div className="mt-2 h-2 w-24 rounded-full bg-primary" />
        </div>

        <div className="p-4 rounded-lg border border-border bg-card">
          <h2 className="font-semibold mb-2">Prisma / Database</h2>
          <p>
            Status:{" "}
            <span
              className={
                dbStatus === "connected"
                  ? "text-green-600 font-medium"
                  : "text-red-600 font-medium"
              }
            >
              {dbStatus}
            </span>
          </p>
          <p>
            Query time: <span className="font-mono text-sm">{dbTime}</span>
          </p>
          {dbStatus === "disconnected" && (
            <p className="mt-2 text-sm text-muted-foreground">
              Set DATABASE_URL in .env to connect to Supabase.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
