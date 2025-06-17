import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymouns user", () => {
    test("with exact case match", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "caseMatch",
          email: "caseMatch@gmail.com",
          password: "caseMatch",
        }),
      });

      expect(response1.status).toBe(201);

      const responseUser = await fetch(
        "http://localhost:3000/api/v1/users/caseMatch",
      );

      expect(responseUser.status).toBe(200);
      const responseUserBody = await responseUser.json();

      expect(responseUserBody).toEqual({
        id: responseUserBody.id,
        username: "caseMatch",
        email: "caseMatch@gmail.com",
        password: responseUserBody.password,
        created_at: responseUserBody.created_at,
        updated_at: responseUserBody.updated_at,
      });
      expect(uuidVersion(responseUserBody.id)).toBe(4);
      expect(Date.parse(responseUserBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseUserBody.updated_at)).not.toBeNaN();
    });

    test("with exact case mismatch", async () => {
      const usernameMock = "caseMismatch";
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameMock,
          email: "caseMismatch@gmail.com",
          password: "caseMismatch",
        }),
      });

      expect(response1.status).toBe(201);

      const responseUser = await fetch(
        `http://localhost:3000/api/v1/users/${usernameMock.toLowerCase()}`,
      );

      expect(responseUser.status).toBe(200);
      const responseUserBody = await responseUser.json();

      expect(responseUserBody).toEqual({
        id: responseUserBody.id,
        username: usernameMock,
        email: "caseMismatch@gmail.com",
        password: responseUserBody.password,
        created_at: responseUserBody.created_at,
        updated_at: responseUserBody.updated_at,
      });
      expect(uuidVersion(responseUserBody.id)).toBe(4);
      expect(Date.parse(responseUserBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseUserBody.updated_at)).not.toBeNaN();
    });

    test("with nonexistent username", async () => {
      const usernameMock = "nonexistent";

      const responseUser = await fetch(
        `http://localhost:3000/api/v1/users/${usernameMock}`,
      );

      expect(responseUser.status).toBe(404);
      const responseUserBody = await responseUser.json();

      expect(responseUserBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema",
        action: "Verifique se o username está correto",
        status_code: 404,
      });
    });
  });
});
