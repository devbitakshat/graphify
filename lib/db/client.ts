import { readFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";

export type Sql = {
  query<T extends Record<string, unknown>>(
    text: string,
    params?: readonly unknown[],
  ): Promise<T[]>;
};

type Adapter = Sql & {
  transaction<T>(fn: (sql: Sql) => Promise<T>): Promise<T>;
};

const schemaSql = readFileSync(path.join(process.cwd(), "db/schema.sql"), "utf8");
const ownershipSql = readFileSync(path.join(process.cwd(), "db/ownership.sql"), "utf8");
const aiSettingsSql = readFileSync(path.join(process.cwd(), "db/ai-settings.sql"), "utf8");

const globalDb = globalThis as unknown as {
  gapmapAdapter?: Promise<Adapter>;
};

function statements(sqlText: string) {
  return sqlBatches(sqlText);
}

function sqlBatches(sqlText: string) {
  const source = sqlText
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  const batches: string[] = [];
  let current = "";
  let inDollar = false;
  for (let index = 0; index < source.length; index += 1) {
    if (source.startsWith("$$", index)) {
      inDollar = !inDollar;
      current += "$$";
      index += 1;
      continue;
    }
    const char = source[index];
    if (char === ";" && !inDollar) {
      const statement = current.trim();
      if (statement) batches.push(statement);
      current = "";
      continue;
    }
    current += char;
  }
  const tail = current.trim();
  if (tail) batches.push(tail);
  return batches;
}

function isMissingTable(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42P01"
  );
}

async function migrationVersions(sql: Sql) {
  try {
    const rows = await sql.query<{ version: number }>("select version from schema_migrations");
    return new Set(rows.map((row) => row.version));
  } catch (error) {
    if (isMissingTable(error)) return new Set<number>();
    throw error;
  }
}

async function applySchema(sql: Sql) {
  const versions = await migrationVersions(sql);
  if (!versions.has(1)) {
    for (const statement of statements(schemaSql)) {
      await sql.query(statement);
    }
  }
  if (!versions.has(2)) {
    for (const statement of sqlBatches(ownershipSql)) {
      await sql.query(statement);
    }
  }
  if (!versions.has(3)) {
    for (const statement of sqlBatches(aiSettingsSql)) {
      await sql.query(statement);
    }
  }
}

function shouldApplySchema() {
  if (process.env.APPLY_SCHEMA === "1") return true;
  if (process.env.APPLY_SCHEMA === "0") return false;
  return process.env.NODE_ENV !== "production";
}

async function createPostgresAdapter(): Promise<Adapter> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required. Use the Supabase Transaction pooler URI (port 6543, ?pgbouncer=true).",
    );
  }

  const isServerless = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const sqlClient = postgres(databaseUrl, {
    max: isServerless ? 1 : 5,
    prepare: false,
    fetch_types: false,
  });
  const sql: Sql = {
    async query(text, params = []) {
      return sqlClient.unsafe(text, params as never[]);
    },
  };
  return {
    ...sql,
    async transaction<T>(fn: (sql: Sql) => Promise<T>) {
      const result = await sqlClient.begin(async (tx) => fn({
        query: async (text, params = []) => tx.unsafe(text, params as never[]),
      }));
      return result as T;
    },
  };
}

/** Tests only: in-memory/local PGlite when ALLOW_PGLITE=1 and DATABASE_URL is unset. */
async function createPgliteAdapter(): Promise<Adapter> {
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = process.env.PGLITE_DIR || path.join(process.cwd(), "data", "pglite");
  const db = new PGlite(dataDir);
  await db.waitReady;
  const sql: Sql = {
    query: (async <T extends Record<string, unknown>>(text: string, params: readonly unknown[] = []) => {
      const result = await db.query<T>(text, [...params]);
      return result.rows as T[];
    }) as Sql["query"],
  };
  return {
    ...sql,
    transaction: (fn) => db.transaction((tx) => fn({
      query: (async <T extends Record<string, unknown>>(text: string, params: readonly unknown[] = []) => {
        const result = await tx.query<T>(text, [...params]);
        return result.rows as T[];
      }) as Sql["query"],
    })),
  };
}

function getAdapter() {
  if (!globalDb.gapmapAdapter) {
    const allowTestPglite = process.env.ALLOW_PGLITE === "1" && !process.env.DATABASE_URL?.trim();
    const created = (allowTestPglite ? createPgliteAdapter() : createPostgresAdapter()).then(async (adapter) => {
      if (allowTestPglite || shouldApplySchema()) await applySchema(adapter);
      return adapter;
    });
    globalDb.gapmapAdapter = created.catch((error: unknown) => {
      globalDb.gapmapAdapter = undefined;
      throw error;
    });
  }
  return globalDb.gapmapAdapter;
}

export async function dbQuery<T extends Record<string, unknown>>(
  text: string,
  params: readonly unknown[] = [],
) {
  const adapter = await getAdapter();
  return adapter.query<T>(text, params);
}

export async function dbOne<T extends Record<string, unknown>>(
  text: string,
  params: readonly unknown[] = [],
) {
  const rows = await dbQuery<T>(text, params);
  return rows[0] ?? null;
}

export async function withTransaction<T>(fn: (sql: Sql) => Promise<T>) {
  const adapter = await getAdapter();
  return adapter.transaction(fn);
}

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
