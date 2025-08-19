import bcryptjs from "bcryptjs";

async function hash(password) {
  const pepperedPassword = addPepperToPassword(password);

  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(pepperedPassword, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providedPassword, storedPassword) {
  const pepperedPassword = addPepperToPassword(providedPassword);

  return await bcryptjs.compare(pepperedPassword, storedPassword);
}

function addPepperToPassword(providedPassword) {
  return `${providedPassword}${process.env.PASSWORD_PEPPER}`;
}

const password = {
  hash,
  compare,
};

export default password;
