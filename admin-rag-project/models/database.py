import chromadb
import os
from chromadb.config import Settings

class ChromaDBManager:
    def __init__(self):
        # Nouvelle configuration ChromaDB
        self.client = chromadb.PersistentClient(
            path="db",
            settings=Settings(
                allow_reset=True,
                anonymized_telemetry=False
            )
        )
        
        # Collections for documents
        self.collections = {
            "SALLE DE BAINS": self.client.get_or_create_collection("salle_de_bains"),
            "REVETEMENT": self.client.get_or_create_collection("revetement"),
            "MENUISERIE EXTERIEURE": self.client.get_or_create_collection("menuiserie_exterieure")
        }
        
        # Collection for AI models
        self.models_collection = self.client.get_or_create_collection("ai_models")
    
    def add_document(self, text, embeddings, category, metadata):
        collection = self.collections.get(category)
        if not collection:
            raise ValueError(f"Catégorie inconnue: {category}")
        
        doc_id = metadata["filename"]
        collection.add(
            documents=[text],
            embeddings=[embeddings],
            metadatas=[metadata],
            ids=[doc_id]
        )
        
        return doc_id
    
    def get_documents(self, category=None):
        if category:
            collections = [self.collections.get(category)]
        else:
            collections = self.collections.values()
        
        documents = []
        for collection in collections:
            items = collection.get()
            for i, doc_id in enumerate(items['ids']):
                documents.append({
                    "id": doc_id,
                    "category": collection.name,
                    "metadata": items['metadatas'][i],
                    "text": items['documents'][i][:200] + "..."  # Extrait seulement
                })
        
        return documents
    
    def delete_document(self, doc_id):
        deleted = False
        for collection in self.collections.values():
            try:
                collection.delete(ids=[doc_id])
                deleted = True
            except:
                continue
        return deleted
    
    def query_collection(self, query, category=None):
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        query_embedding = model.encode(query).tolist()
        
        if category:
            collections = [self.collections.get(category)]
        else:
            collections = self.collections.values()
        
        results = []
        for collection in collections:
            query_result = collection.query(
                query_embeddings=[query_embedding],
                n_results=3
            )
            
            for i, doc_id in enumerate(query_result['ids'][0]):
                results.append({
                    "id": doc_id,
                    "category": collection.name,
                    "score": query_result['distances'][0][i],
                    "metadata": query_result['metadatas'][0][i],
                    "text": query_result['documents'][0][i]
                })
        
        return sorted(results, key=lambda x: x['score'])
    
    # Model management methods
    def create_model(self, name, description):
        import uuid
        from datetime import datetime
        import json
        
        model_id = str(uuid.uuid4())
        model_data = {
            "id": model_id,
            "name": name,
            "description": description,
            "status": "Pending",
            "dateCreated": datetime.utcnow().isoformat(),
            "files": []
        }
        
        # Create a copy of the data with files serialized for ChromaDB storage
        chroma_data = {**model_data}
        chroma_data["files"] = json.dumps(model_data["files"])
        
        self.models_collection.add(
            documents=[str(model_data)],
            metadatas=[chroma_data],
            ids=[model_id]
        )
        
        return model_data

    def get_models(self, skip=0, limit=10):
        import json
        items = self.models_collection.get()
        models = []
        
        for i, model_id in enumerate(items['ids']):
            model_data = items['metadatas'][i]
            # Deserialize the files array
            model_data["files"] = json.loads(model_data["files"])
            models.append(model_data)
        
        total = len(models)
        models = models[skip:skip + limit]
        
        return {"models": models, "total": total}

    def get_model_by_id(self, model_id):
        import json
        try:
            result = self.models_collection.get(ids=[model_id])
            if result['metadatas']:
                model_data = result['metadatas'][0]
                # Deserialize the files array
                model_data["files"] = json.loads(model_data["files"])
                return model_data
            return None
        except:
            return None

    def delete_model(self, model_id):
        try:
            model = self.get_model_by_id(model_id)
            if model:
                # Delete all model files
                for file in model['files']:
                    if os.path.exists(file['path']):
                        os.remove(file['path'])
                
                # Delete model from collection
                self.models_collection.delete(ids=[model_id])
                return True
            return False
        except:
            return False

    def update_model(self, model_id, updates):
        import json
        try:
            model = self.get_model_by_id(model_id)
            if model:
                updated_model = {**model, **updates}
                
                # Create a copy of the data with files serialized for ChromaDB storage
                chroma_data = {**updated_model}
                chroma_data["files"] = json.dumps(updated_model["files"])
                
                self.models_collection.update(
                    ids=[model_id],
                    metadatas=[chroma_data],
                    documents=[str(updated_model)]
                )
                return updated_model
            return None
        except:
            return None

    def add_model_files(self, model_id, files):
        import uuid
        import json
        
        model = self.get_model_by_id(model_id)
        if not model:
            return None
        
        new_files = []
        for file in files:
            file_id = str(uuid.uuid4())
            file_data = {
                "id": file_id,
                "name": file.filename,
                "path": os.path.join("uploads", f"{file_id}_{file.filename}")
            }
            file.save(file_data["path"])
            new_files.append(file_data)
        
        model['files'].extend(new_files)
        return self.update_model(model_id, {"files": model['files']})

    def delete_model_file(self, model_id, file_id):
        model = self.get_model_by_id(model_id)
        if not model:
            return False
            
        file_to_delete = next((f for f in model['files'] if f['id'] == file_id), None)
        if file_to_delete:
            # Remove file from filesystem
            if os.path.exists(file_to_delete['path']):
                os.remove(file_to_delete['path'])
            
            # Update model files list
            model['files'] = [f for f in model['files'] if f['id'] != file_id]
            self.update_model(model_id, {"files": model['files']})
            return True
            
        return False