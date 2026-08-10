import {
  getCareerCollection,
  getCareerCollectionCount,
} from "@/lib/rag/vectorStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log(
      "=== CHROMA COLLECTION TEST ==="
    );

    const collection =
      await getCareerCollection();

    console.log(
      "Collection:",
      collection.name
    );

    console.log(
      "Collection ID:",
      collection.id
    );

    const count =
      await getCareerCollectionCount(
        collection.id
      );

    console.log(
      "Document count:",
      count
    );

    return Response.json({
      success: true,
      message:
        "ChromaDB connected successfully.",
      collection: collection.name,
      collectionId: collection.id,
      documentCount: count,
    });
  } catch (error) {
    console.error(
      "=== CHROMA TEST ERROR ==="
    );

    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Chroma test failed.",
      },
      {
        status: 500,
      }
    );
  }
}