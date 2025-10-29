import { NotFoundError, UnautorizedError } from "infra/errors";
import password from "models/password";
import user from "models/user";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnautorizedError) {
      throw new UnautorizedError({
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
    console.log(storedUser);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnautorizedError({
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
    throw new UnautorizedError({
      message: "Senha não confere",
      action: "Verifique os dados informados e tente novamente",
    });
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
