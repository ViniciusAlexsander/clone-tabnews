import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors";

async function create(userInputValues) {
  await validateUniqueUser(userInputValues.username, userInputValues.email);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueUser(username, email) {
    const results = await database.query({
      text: `
        SELECT
          username, email
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)
        ;`,
      values: [username, email],
    });

    if (results.rowCount > 0) {
      const user = results.rows[0];
      if (email && user.email.toLowerCase() === email.toLowerCase()) {
        throw new ValidationError({
          message: "Email já cadastrado",
          action: "Utilize outro email para realizar o cadastro",
        });
      }
      if (username && user.username.toLowerCase() === username.toLowerCase()) {
        throw new ValidationError({
          message: "Username já cadastrado",
          action: "Utilize outro username para realizar o cadastro",
        });
      }
    }
  }

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema",
        action: "Verifique se o username está correto",
      });
    }

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
