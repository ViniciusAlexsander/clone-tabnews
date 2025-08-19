import controller from "infra/controller";
import { createRouter } from "next-connect";
import user from "models/user";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;

  const userResponse = await user.findOneByUsername(username);
  return response.status(200).json(userResponse);
}

async function patchHandler(request, response) {
  const username = request.query.username;

  const userInputValues = request.body;

  const updateUser = await user.update(username, userInputValues);

  return response.status(200).json(updateUser);
}
