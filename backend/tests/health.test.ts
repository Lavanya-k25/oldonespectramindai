import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma.js", () => ({ prisma: { $disconnect: vi.fn(), $queryRaw: vi.fn() } }));
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
process.env.NODE_ENV = "test";

describe("health endpoint", () => {
  let app: Awaited<ReturnType<typeof import("../src/app.js")["buildApp"]>>;
  beforeAll(async () => { const module = await import("../src/app.js"); app = await module.buildApp(); });

  it("reports process health", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("ok");
  });
});
