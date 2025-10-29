import controller from "infra/controller";
import { UnautorizedError } from "infra/errors";
import authentication from "models/authentication";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  return response.status(201).json({});
}
