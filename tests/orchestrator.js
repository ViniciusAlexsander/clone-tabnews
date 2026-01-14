import { faker } from "@faker-js/faker";
import retry from "async-retry";

import database from "infra/database";
import migrator from "models/migrator";
import session from "models/session";
import user from "models/user";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, { retries: 100, maxTimeout: 5000 });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userInputValues) {
  return await user.create({
    username:
      userInputValues?.username ||
      faker.internet.username().replace(/[_.-]/g, ""),
    email: userInputValues?.email || faker.internet.email(),
    password: userInputValues?.password || faker.internet.password(),
  });
}

async function createSessionForUser(userId) {
  return await session.create(userId);
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSessionForUser,
};
export default orchestrator;
