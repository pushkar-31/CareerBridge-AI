import dns from "node:dns";
import https from "node:https";

dns.setDefaultResultOrder("ipv4first");

const apiKey = process.env.CHROMA_API_KEY;
const tenant = process.env.CHROMA_TENANT;
const database = process.env.CHROMA_DATABASE;

if (!apiKey) {
  throw new Error("CHROMA_API_KEY is not configured.");
}

if (!tenant) {
  throw new Error("CHROMA_TENANT is not configured.");
}

if (!database) {
  throw new Error("CHROMA_DATABASE is not configured.");
}

const CHROMA_API_KEY = apiKey;
const CHROMA_TENANT = tenant;
const CHROMA_DATABASE = database;

const BASE_URL = "https://api.trychroma.com/api/v2";

export const COLLECTION_NAME =
  "skillbridge-career-documents";

/**
 * Make a Chroma Cloud REST request.
 *
 * We use Node's https module instead of fetch()
 * so that we can explicitly force IPv4.
 */
async function chromaRequest(
  path: string,
  options: {
    method?: string;
    body?: string;
  } = {}
): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: url.hostname,
        port: 443,
        path: `${url.pathname}${url.search}`,
        method: options.method || "GET",

        family: 4,

        lookup: (
          hostname,
          _options,
          callback
        ) => {
          dns.lookup(
            hostname,
            {
              family: 4,
            },
            callback
          );
        },

        headers: {
          "Content-Type": "application/json",
          "x-chroma-token": CHROMA_API_KEY,

          ...(options.body
            ? {
                "Content-Length": Buffer.byteLength(
                  options.body
                ),
              }
            : {}),
        },

        timeout: 15000,
      },

      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          let parsedData: any = null;

          try {
            parsedData = data
              ? JSON.parse(data)
              : null;
          } catch {
            parsedData = data;
          }

          if (
            response.statusCode &&
            response.statusCode >= 200 &&
            response.statusCode < 300
          ) {
            resolve(parsedData);
          } else {
            reject(
              new Error(
                `Chroma API ${response.statusCode}: ${data}`
              )
            );
          }
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(
        new Error(
          "Chroma Cloud request timed out."
        )
      );
    });

    request.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      request.write(options.body);
    }

    request.end();
  });
}

/**
 * Get existing collection or create it.
 */
export async function getCareerCollection() {
  console.log(
    "Getting Chroma collection through REST API..."
  );

  const collections = await chromaRequest(
    `/tenants/${encodeURIComponent(
      CHROMA_TENANT
    )}/databases/${encodeURIComponent(
      CHROMA_DATABASE
    )}/collections`
  );

  const existing = Array.isArray(collections)
    ? collections.find(
        (collection: any) =>
          collection.name ===
          COLLECTION_NAME
      )
    : null;

  if (existing) {
    console.log(
      "Existing collection found:",
      existing.id
    );

    return existing;
  }

  console.log(
    "Collection does not exist. Creating it..."
  );

  const collection = await chromaRequest(
    `/tenants/${encodeURIComponent(
      CHROMA_TENANT
    )}/databases/${encodeURIComponent(
      CHROMA_DATABASE
    )}/collections`,
    {
      method: "POST",

      body: JSON.stringify({
        name: COLLECTION_NAME,
        get_or_create: true,
      }),
    }
  );

  console.log(
    "Collection created:",
    collection.id
  );

  return collection;
}

/**
 * Add document chunks and their Gemini embeddings
 * to ChromaDB.
 */
export async function addToCareerCollection(
  collectionId: string,
  ids: string[],
  documents: string[],
  embeddings: number[][],
  metadatas: Record<
    string,
    string | number
  >[]
) {
  console.log(
    "Adding records to ChromaDB..."
  );

  await chromaRequest(
    `/tenants/${encodeURIComponent(
      CHROMA_TENANT
    )}/databases/${encodeURIComponent(
      CHROMA_DATABASE
    )}/collections/${encodeURIComponent(
      collectionId
    )}/add`,
    {
      method: "POST",

      body: JSON.stringify({
        ids,
        documents,
        embeddings,
        metadatas,
      }),
    }
  );

  console.log(
    "Records added successfully."
  );
}

/**
 * Get number of records stored in Chroma.
 */
export async function getCareerCollectionCount(
  collectionId: string
) {
  const count = await chromaRequest(
    `/tenants/${encodeURIComponent(
      CHROMA_TENANT
    )}/databases/${encodeURIComponent(
      CHROMA_DATABASE
    )}/collections/${encodeURIComponent(
      collectionId
    )}/count`
  );

  return count;
}