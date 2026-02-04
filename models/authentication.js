import { NotFoundError, UnauthorizedError } from "infra/errors";
import password from "models/password";
import user from "models/user";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação inválidos",
        action: "Verifique os dados informados e tente novamente",
      });
    }

    throw error;
  }
}

async function findUserByEmail(providedEmail) {
  let storedUser;
  try {
    storedUser = await user.findOneByEmail(providedEmail);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Email não confere",
        action: "Verifique os dados informados e tente novamente",
      });
    }

    throw error;
  }

  return storedUser;
}

async function validatePassword(providedPassword, storedPasswordHash) {
  const correctPassword = await password.compare(
    providedPassword,
    storedPasswordHash,
  );

  if (!correctPassword) {
    throw new UnauthorizedError({
      message: "Senha não confere",
      action: "Verifique os dados informados e tente novamente",
    });
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
