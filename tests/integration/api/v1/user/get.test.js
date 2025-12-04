import session from "models/session.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("default user", () => {
    test("with valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "userWithValidSession",
      });

      const sessionObject = await orchestrator.createSessionForUser(
        createdUser.id,
      );

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "userWithValidSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });
    });

    test("with nonexistent session", async () => {
      const nonexistentSessionToken =
        "b8a7d2eec7c120c11f07cb93565fd709e6920cabf284c614924c2a6cdcdbcc8dff57535f65cedb0ac57ac61b7ef78025";

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${nonexistentSessionToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnautorizedError",
        message: "Usuário não possui sessão válida",
        action: "Verifique se este usuário está logado e tente novamente",
        status_code: 401,
      });
    });

    test("with expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "userWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSessionForUser(
        createdUser.id,
      );

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnautorizedError",
        message: "Usuário não possui sessão válida",
        action: "Verifique se este usuário está logado e tente novamente",
        status_code: 401,
      });
    });
  });
});
