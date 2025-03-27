import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  return (
    <div>
      <h1>Status do site</h1>
      <UpdatedAt />
    </div>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 1000 * 60,
  });

  if (isLoading && !data) {
    return (
      <div>
        <p>Buscando informações atualizadas</p>
      </div>
    );
  }

  return (
    <div>
      <p>
        Última atualização: {new Date(data.updated_at).toLocaleString("pt-BR")}
      </p>
      <div>
        <h2>Banco de dados</h2>
        <div>
          <p>
            Conexões disponíveis:{" "}
            <strong>{data.dependencies.database.max_connections}</strong>
          </p>
          <p>
            Conexões abertas:{" "}
            <strong>{data.dependencies.database.opened_connections}</strong>
          </p>
          <p>
            Versão do PostgreSQL:{" "}
            <strong>{data.dependencies.database.version}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
