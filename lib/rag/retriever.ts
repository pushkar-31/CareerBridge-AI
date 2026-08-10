import dns from "node:dns";
import https from "node:https";
import { embeddings } from "./embeddings";
import { COLLECTION_NAME } from "./vectorStore";

dns.setDefaultResultOrder("ipv4first");

const apiKey = process.env.CHROMA_API_KEY;
const tenant = process.env.CHROMA_TENANT;
const database = process.env.CHROMA_DATABASE;

if (!apiKey) {
  throw new Error(
    "CHROMA_API_KEY is not configured."
  );
}

if (!tenant) {
  throw new Error(
    "CHROMA_TENANT is not configured."
  );
}

if (!database) {
  throw new Error(
    "CHROMA_DATABASE is not configured."
  );
}

const CHROMA_API_KEY = apiKey;
const CHROMA_TENANT = tenant;
const CHROMA_DATABASE = database;

const BASE_URL =
  "https://api.trychroma.com/api/v2";

/**
 * Make a request to Chroma Cloud using IPv4.
 */
async function chromaRequest(
  path: string,
  options: {
    method?: string;
    body?: string;
  } = {}
): Promise<any> {
  const url = new URL(
    `${BASE_URL}${path}`
  );

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: url.hostname,
        port: 443,
        path:
          url.pathname + url.search,
        method:
          options.method || "GET",

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
          "Content-Type":
            "application/json",

          "x-chroma-token":
            CHROMA_API_KEY,

          ...(options.body
            ? {
                "Content-Length":
                  Buffer.byteLength(
                    options.body
                  ),
              }
            : {}),
        },

        timeout: 15000,
      },

      (response) => {
        let data = "";

        response.on(
          "data",
          (chunk) => {
            data += chunk;
          }
        );

        response.on(
          "end",
          () => {
            let parsedData: any;

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
          }
        );
      }
    );

    request.on(
      "timeout",
      () => {
        request.destroy(
          new Error(
            "Chroma Cloud request timed out."
          )
        );
      }
    );

    request.on(
      "error",
      (error) => {
        reject(error);
      }
    );

    if (options.body) {
      request.write(
        options.body
      );
    }

    request.end();
  });
}

/**
 * Search vectors belonging ONLY to
 * the current Career Chat session.
 */
export async function retrieveRelevantChunks(
  query: string,
  sessionId: string,
  documentType?: "resume" | "jd",
  topK: number = 3
) {
  if (!query || !query.trim()) {
    throw new Error(
      "Query cannot be empty."
    );
  }

  if (
    !sessionId ||
    !sessionId.trim()
  ) {
    throw new Error(
      "Session ID is required for retrieval."
    );
  }

  console.log(
    "=== VECTOR RETRIEVAL STARTED ==="
  );

  console.log(
    "Query:",
    query
  );

  console.log(
    "Session ID:",
    sessionId
  );

  if (documentType) {
    console.log(
      "Document type:",
      documentType
    );
  } else {
    console.log(
      "Document type: resume + jd"
    );
  }

  // --------------------------------
  // 1. Convert question to embedding
  // --------------------------------

  console.log(
    "Generating query embedding..."
  );

  const queryVector =
    await embeddings.embedQuery(
      query
    );

  console.log(
    "Query embedding generated."
  );

  // --------------------------------
  // 2. Get collection
  // --------------------------------

  const collections =
    await chromaRequest(
      `/tenants/${encodeURIComponent(
        CHROMA_TENANT
      )}/databases/${encodeURIComponent(
        CHROMA_DATABASE
      )}/collections`
    );

  const collection =
    Array.isArray(collections)
      ? collections.find(
          (item: any) =>
            item.name ===
            COLLECTION_NAME
        )
      : null;

  if (!collection) {
    throw new Error(
      `Chroma collection "${COLLECTION_NAME}" not found.`
    );
  }

  // --------------------------------
  // 3. Build session filter
  // --------------------------------

 let where: Record<string, unknown>;

if (documentType) {
  where = {
    $and: [
      {
        sessionId: {
          $eq: sessionId,
        },
      },
      {
        documentType: {
          $eq: documentType,
        },
      },
    ],
  };
} else {
  where = {
    sessionId: {
      $eq: sessionId,
    },
  };
}

  console.log(
    "Chroma filter:",
    where
  );

  // --------------------------------
  // 4. Query Chroma
  // --------------------------------

  console.log(
    "Searching ChromaDB..."
  );

  const body: Record<
    string,
    unknown
  > = {
    query_embeddings: [
      queryVector,
    ],

    n_results: topK,

    include: [
      "documents",
      "metadatas",
      "distances",
    ],

    where,
  };

  const result =
    await chromaRequest(
      `/tenants/${encodeURIComponent(
        CHROMA_TENANT
      )}/databases/${encodeURIComponent(
        CHROMA_DATABASE
      )}/collections/${encodeURIComponent(
        collection.id
      )}/query`,
      {
        method: "POST",
        body: JSON.stringify(
          body
        ),
      }
    );

  console.log(
    "=== VECTOR RETRIEVAL COMPLETE ==="
  );

  const resultCount =
    result?.documents?.[0]
      ?.length ?? 0;

  console.log(
    "Retrieved chunks:",
    resultCount
  );

  return result;
}