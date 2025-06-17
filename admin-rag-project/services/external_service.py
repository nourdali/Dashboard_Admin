from config import Config
import requests
from typing import List, Dict, Optional, Any, Tuple
import logging
from requests.exceptions import RequestException

# Utilisez la configuration
settings = Config()
logger = logging.getLogger(__name__)

class ExternalService:
    @staticmethod
    def forward_request(url, method='POST', files=None, data=None):
        import requests
        method = method.upper()
        logger.info(f"Sending {method} request to {url} with data: {data}, files: {[f[1][0] for f in files] if files else None}")
        try:
            if method == 'POST':
                if files:
                    # Pour les requêtes avec fichiers, utiliser multipart/form-data
                    response = requests.post(url, files=files, data=data)
                else:
                    # Pour les requêtes JSON, utiliser json=data
                    response = requests.post(url, json=data)
            elif method == 'GET':
                response = requests.get(url, params=data)
            elif method == 'DELETE':
                response = requests.delete(url, data=data)
            else:
                return {"error": "Unsupported HTTP method"}, 400
            
            logger.info(f"Received response: {response.status_code} - {response.text}")
            try:
                return response.json(), response.status_code
            except ValueError:
                logger.error(f"Invalid JSON response from {url}: {response.text}")
                return {"error": "Invalid JSON response"}, response.status_code
        except RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            return {"error": f"Request failed: {str(e)}"}, 500
    
'''
class DocumentService:
    @staticmethod
    def load_documents(file_path: str) -> Tuple[Dict, int]:
        """Load documents based on file extension"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/load-documents",
            method='POST',
            data={'file_path': file_path}
        )

    @staticmethod
    def upload_document(file: Any, category: str) -> Tuple[Dict, int]:
        """Upload a document with category"""
        files = {'file': (file.filename, file.stream, file.content_type)}
        data = {'category': category}
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/documents",
            method='POST',
            files=files,
            data=data
        )
    
    @staticmethod
    def get_documents(category: Optional[str] = None) -> Tuple[Dict, int]:
        """Get documents, optionally filtered by category"""
        url = f"{settings.MODEL_SERVICE_URL}/documents"
        params = {'category': category} if category else None
        return ExternalService.forward_request(url, params=params)
    
    @staticmethod
    def delete_document(doc_id: str) -> Tuple[Dict, int]:
        """Delete a document by ID"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/documents/{doc_id}",
            method='DELETE'
        )
'''
class VectorStoreService:
    @staticmethod
    def init_vector_store() -> Tuple[Dict, int]:
        """Initialize the global vector store"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/init-vector-store",
            method='POST'
        )

  

class ModelService:
    
    @staticmethod
    def create_model(name: str, description: Optional[str] = None) -> Tuple[Dict, int]:
        logger.info(f"Creating model with name: {name}, description: {description}")
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/models",
            method='POST',
            data={'name': name, 'description': description}
        )
        
        
    @staticmethod
    def list_models() -> Tuple[Dict, int]:
        """List all available models"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/models",
            method='GET'
        )
        
    @staticmethod
    def get_model(model_id: str) -> Tuple[Dict, int]:
        """List files for a specific model"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/models/{model_id}",
            method='GET'
        )
    
    @staticmethod
    def delete_model(model_id: str) -> Tuple[Dict, int]:
        """Delete a model and its associated files"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/models/{model_id}",
            method='DELETE'
        )
  

    @staticmethod
    def upload_file(model_name: str, files: List[Any]) -> Tuple[Dict, int]:
        files_list = [(f'files[]', (f.filename, f.stream, f.content_type)) for f in files]
        logger.info(f"Sending {len(files_list)} files to external service: {[f[1][0] for f in files_list]}")
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/upload",
            method='POST',
            files=files_list,
            data={'model_name': model_name}
        )
        
'''         
    @staticmethod
    def train_model(model_id: str) -> Tuple[Dict, int]:
        """Train a specific model"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/models/{model_id}/train",
            method='POST'
        )
       
ModelManagementService = ModelService

class ModelManagementService:
    @staticmethod
    def delete_model(model_id: str):
        """Supprime complètement un modèle"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/models/{model_id}",
            method='DELETE'
        )
    
    @staticmethod
    def update_model_files(model_id: str, files):
        """
        Met à jour les fichiers d'un modèle
        Args:
            model_id: L'ID du modèle à mettre à jour
            files: Liste de fichiers à uploader
        """
        files_dict = {
            f'files[]': (f.filename, f.stream, f.content_type) 
            for f in files
        }
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/update-model",
            method='POST',
            files=files_dict,
            data={'model_id': model_id}
        )
    
    @staticmethod
    def reembed_model(model_id: str):
        """Relance l'embedding pour un modèle existant"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/reembed",
            method='POST',
            data={'model_id': model_id}
        )
'''        
class FileService:
     
    @staticmethod
    def update_model_files(model_id: str, files: List[Any]) -> Tuple[Dict, int]:
        """Update files for a specific model"""
        files_dict = {f'files[]': (f.filename, f.stream, f.content_type) for f in files}
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/update-model",
            method='POST',
            files=files_dict,
            data={'model_id': model_id}
        )

    @staticmethod
    def get_model_file(model_id: str, filename: str) -> Tuple[Any, int]:
        """Get a specific model file"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/models/{model_id}/files/{filename}",
            method='GET',
            return_json=False
        )

    @staticmethod
    def delete_model_file(model_id: str, filename: str) -> Tuple[Dict, int]:
        """Delete a specific model file"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/models/{model_id}/files/{filename}",
            method='DELETE'
        )

class EmbeddingService:
    @staticmethod
    def embed_documents(model_name: str) -> Tuple[Dict, int]:
        
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/embed",
            method='POST',
            data={'model_name': model_name}
        )   
    
    @staticmethod
    def reembed_model(model_id: str) -> Tuple[Dict, int]:
        """Re-embed all documents for a model"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/reembed",
            method='POST',
            data={'model_id': model_id}
        )
    
    @staticmethod
    def get_embedding_status(model_id: str) -> Tuple[Dict, int]:
        """Get embedding status for a model"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/models/{model_id}/embedding-status",
            method='GET'
        )

class ChatService:
    @staticmethod
    def ask_question(model_name: str, question: str) -> Tuple[Dict, int]:
        """Ask a question to a specific model"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/ask",
            method='POST',
            data={
                'model_name': model_name,
                'question': question
            }
        )

    @staticmethod
    def get_chat_history() -> Tuple[Dict, int]:
        """Get complete chat history"""
        return ExternalService.forward_request(
            f"{settings.MODEL_SERVICE_URL}/history",
            method='GET'
        )