import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
    const maxConnections = (await database.query("SHOW max_connections;"))
      .rows[0].max_connections;
    const version = (await database.query("SHOW server_version;")).rows[0]
      .server_version;

    const databaseName = process.env.POSTGRES_DB;
    const databaseOpenedConnectionsResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });

    const databaseOpenedConnectionsValue =
      databaseOpenedConnectionsResult.rows[0].count;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          max_connections: Number(maxConnections),
          opened_connections: Number(databaseOpenedConnectionsValue),
          version,
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    response.status(publicErrorObject.status_code).json(publicErrorObject);
  }
}

export default status;
