import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "cacamba <contato@cacambito.com.br>",
      to: "viniciusalexsander11@gmail.com",
      subject: "Teste de assunto",
      text: "Teste de corpo",
    });

    await email.send({
      from: "cacamba <contato@cacambito.com.br>",
      to: "viniciusalexsander11@gmail.com",
      subject: "Teste de assunto 2 email",
      text: "Ultimo email enviado",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@cacambito.com.br>");
    expect(lastEmail.recipients[0]).toBe("<viniciusalexsander11@gmail.com>");
    expect(lastEmail.subject).toBe("Teste de assunto 2 email");
    expect(lastEmail.text).toBe("Ultimo email enviado\n");
  });
});
