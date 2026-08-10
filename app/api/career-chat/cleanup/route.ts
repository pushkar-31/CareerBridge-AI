import dns from "node:dns";
import https from "node:https";
import { COLLECTION_NAME } from "@/lib/rag/vectorStore";

export const runtime = "nodejs";

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

  return new Promise(
    (resolve, reject) => {
      const request =
        https.request(
          {
            hostname:
              url.hostname,

            port: 443,

            path:
              url.pathname +
              url.search,

            method:
              options.method ||
              "GET",

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
                  response.statusCode >=
                    200 &&
                  response.statusCode < 300
                ) {
                  resolve(
                    parsedData
                  );
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
    }
  );
}

export async function POST(
  request: Request
) {
  try {
    console.log(
      "=== CAREER CHAT CLEANUP STARTED ==="
    );

    const body =
      await request.json();

    const sessionId =
      body?.sessionId?.trim();

    // --------------------------------
    // Validate session
    // --------------------------------

    if (!sessionId) {
      return Response.json(
        {
          success: false,
          message:
            "Session ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "Cleaning session:",
      sessionId
    );

    // --------------------------------
    // 1. Find Chroma collection
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
      Array.isArray(
        collections
      )
        ? collections.find(
            (item: any) =>
              item.name ===
              COLLECTION_NAME
          )
        : null;

    if (!collection) {
      return Response.json({
        success: true,
        message:
          "No Career Chat collection exists.",
        deleted: 0,
      });
    }

    console.log(
      "Collection:",
      collection.id
    );

    // --------------------------------
    // 2. Get IDs belonging to session
    // --------------------------------

    console.log(
      "Finding session documents..."
    );

    const getResult =
      await chromaRequest(
        `/tenants/${encodeURIComponent(
          CHROMA_TENANT
        )}/databases/${encodeURIComponent(
          CHROMA_DATABASE
        )}/collections/${encodeURIComponent(
          collection.id
        )}/get`,
        {
          method: "POST",

          body: JSON.stringify({
            where: {
              sessionId,
            },

            include: [
              "metadatas",
            ],
          }),
        }
      );

    const ids =
      Array.isArray(
        getResult?.ids
      )
        ? getResult.ids
        : [];

    console.log(
      "Documents found:",
      ids.length
    );

    // --------------------------------
    // 3. Nothing to delete
    // --------------------------------

    if (ids.length === 0) {
      console.log(
        "No documents found for session."
      );

      return Response.json({
        success: true,
        message:
          "No documents found for this session.",
        deleted: 0,
      });
    }

    // --------------------------------
    // 4. Delete session documents
    // --------------------------------

    console.log(
      "Deleting session documents..."
    );

    await chromaRequest(
      `/tenants/${encodeURIComponent(
        CHROMA_TENANT
      )}/databases/${encodeURIComponent(
        CHROMA_DATABASE
      )}/collections/${encodeURIComponent(
        collection.id
      )}/delete`,
      {
        method: "POST",

        body: JSON.stringify({
          ids,
        }),
      }
    );

    console.log(
      "=== CAREER CHAT CLEANUP COMPLETE ==="
    );

    console.log(
      "Deleted documents:",
      ids.length
    );

    return Response.json({
      success: true,

      message:
        "Career Chat session data deleted successfully.",

      deleted: ids.length,

      sessionId,
    });
  } catch (error) {
    console.error(
      "=== CAREER CHAT CLEANUP ERROR ==="
    );

    console.error(error);

    return Response.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Career Chat cleanup failed.",
      },
      {
        status: 500,
      }
    );
  }
}