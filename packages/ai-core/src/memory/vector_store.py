from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import os


class VectorStore:
    """Qdrant vector store for shared memory between agents"""

    def __init__(self):
        self.client = QdrantClient(
            url=os.getenv("QDRANT_URL", "http://localhost:6333"),
            api_key=os.getenv("QDRANT_API_KEY", None)
        )
        self.collections = {
            "menu_embeddings": "menu_embeddings",
            "conversation_history": "conversation_history",
            "alert_fingerprints": "alert_fingerprints",
            "transaction_patterns": "transaction_patterns"
        }
        self._init_collections()

    def _init_collections(self):
        """Initialize Qdrant collections"""
        for name in self.collections.values():
            try:
                self.client.get_collection(name)
            except Exception:
                self.client.create_collection(
                    collection_name=name,
                    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
                )

    def upsert(self, collection: str, id: str, vector: list, payload: dict):
        """Upsert a vector into a collection"""
        self.client.upsert(
            collection_name=collection,
            points=[PointStruct(id=id, vector=vector, payload=payload)]
        )

    def search(self, collection: str, vector: list, limit: int = 5) -> list:
        """Search for similar vectors"""
        results = self.client.search(
            collection_name=collection,
            query_vector=vector,
            limit=limit
        )
        return [{"id": r.id, "score": r.score, "payload": r.payload} for r in results]

    def delete(self, collection: str, id: str):
        """Delete a vector"""
        self.client.delete(
            collection_name=collection,
            points_selector=[id]
        )
