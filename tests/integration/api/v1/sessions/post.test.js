import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymouns user", () => {
    test("with incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password: "cacambito123",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.errado@gmail.com",
          password: "cacambito123",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnautorizedError",
        message: "Dados de autenticação inválidos",
        action: "Verifique os dados informados e tente novamente",
        status_code: 401,
      });
    });

    test("with correct `email` but incorrect `password`", async () => {
      await orchestrator.createUser({
        email: "cacambito123@gmail.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "cacambito123@gmail.com",
          password: "senha-errada",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnautorizedError",
        message: "Dados de autenticação inválidos",
        action: "Verifique os dados informados e tente novamente",
        status_code: 401,
      });
    });

    test("with incorrect `email` and incorrect `password`", async () => {
      await orchestrator.createUser({});

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.errado@gmail.com",
          password: "senha-errada",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnautorizedError",
        message: "Dados de autenticação inválidos",
        action: "Verifique os dados informados e tente novamente",
        status_code: 401,
      });
    });
  });
});
