import orchestrator from "tests/orchestrator";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymouns user", () => {
    test("with nonexistent username", async () => {
      const usernameMock = "nonexistent";

      const responseUser = await fetch(
        `http://localhost:3000/api/v1/users/${usernameMock}`,
        {
          method: "PATCH",
        },
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

    test("with change username case", async () => {
      await orchestrator.createUser({
        username: "case1",
      });

      const updateUser2Response = await fetch(
        "http://localhost:3000/api/v1/users/case1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "CaSe1",
          }),
        },
      );

      expect(updateUser2Response.status).toBe(200);
    });

    test("with duplicated username", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

      const updateUser2Response = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user1",
          }),
        },
      );

      expect(updateUser2Response.status).toBe(400);

      const responseUser2Body = await updateUser2Response.json();

      expect(responseUser2Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado",
        action: "Utilize outro username para esta operação",
        status_code: 400,
      });
    });

    test("with duplicated email", async () => {
      await orchestrator.createUser({
        email: "email1@gmail.com",
      });

      const user2 = await orchestrator.createUser({
        email: "email2@gmail.com",
      });

      const updateEmail2Response = await fetch(
        `http://localhost:3000/api/v1/users/${user2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@gmail.com",
          }),
        },
      );

      expect(updateEmail2Response.status).toBe(400);

      const responseUser2Body = await updateEmail2Response.json();

      expect(responseUser2Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado",
        action: "Utilize outro email para esta operação",
        status_code: 400,
      });
    });

    test("with unique 'username'", async () => {
      await orchestrator.createUser({
        username: "uniqueUser1",
        email: "uniqueUser1@gmail.com",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser22",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser22",
        email: "uniqueUser1@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(responseBody.updated_at > responseBody.created_at).toBeTruthy();
    });

    test("with unique 'email'", async () => {
      await orchestrator.createUser({
        username: "uniqueEmail",
        email: "uniqueEmail@gmail.com",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueEmail",
        email: "uniqueEmail2@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(responseBody.updated_at > responseBody.created_at).toBeTruthy();
    });

    test("with new 'password'", async () => {
      await orchestrator.createUser({
        username: "newPassword",
        email: "newPassword@gmail.com",
        password: "newPassword",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/newPassword",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newPassword",
        email: "newPassword@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(responseBody.updated_at > responseBody.created_at).toBeTruthy();

      const userInDatabase = await user.findOneByUsername("newPassword");

      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "newPassword",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
