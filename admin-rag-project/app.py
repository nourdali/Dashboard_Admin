from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_socketio import SocketIO
import logging
from config import Config
from services.external_service import ChatService, EmbeddingService, FileService, ModelService

# Initialize Flask app
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Load configuration
app.config.from_object(Config)

# Configure logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format=Config.LOG_FORMAT
)
logger = logging.getLogger(__name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return jsonify({"status": "API is running", "message": "Welcome to RAG API"})


# Model Routes
@app.route('/api/models', methods=['POST'])
def create_model():
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        
        if not name:
            return jsonify({"error": "Model name is required"}), 400
            
        response, status_code = ModelService.create_model(name, description)
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error creating model: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
from flask import request, jsonify

@app.route('/api/models/upload-model', methods=['POST'])
def upload_files():
    try:
        # Access model_id from the form data
        model_name = request.form.get('model_name')
        if not model_name:
            return jsonify({"error": "Missing model_name"}), 400

        if 'files[]' not in request.files:
            return jsonify({"error": "No files provided"}), 400

        files = request.files.getlist('files[]')
        valid_files = [f for f in files if f.filename and allowed_file(f.filename)]

        if not valid_files:
            return jsonify({"error": "No valid files provided"}), 400

        response, status_code = ModelService.upload_files(model_name, valid_files)
        return jsonify(response), status_code

    except Exception as e:
        logger.error(f"Error uploading model files: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/models', methods=['GET'])
def list_models():
    try:
        response, status_code = ModelService.list_models()
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/api/models/<model_id>', methods=['GET'])
def get_model(model_id):
    try:
        response, status_code = ModelService.get_model(model_id)
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error getting model: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/models/<model_id>', methods=['DELETE'])
def delete_model(model_id):
    try:
        response, status_code = ModelService.delete_model(model_id)
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error deleting model: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Model Files Routes
@app.route('/api/models/<model_id>/files', methods=['POST'])
def update_model_files(model_id):
    try:
        if 'files[]' not in request.files:
            return jsonify({"error": "No files provided"}), 400
            
        files = request.files.getlist('files[]')
        #valid_files = [f for f in files if f.filename and allowed_file(f.filename)]
        
        if not files:
            return jsonify({"error": "No valid files provided"}), 400
            
        response, status_code = FileService.update_model_files(model_id, files)
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error uploading model files: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/models/<model_id>/files/<path:filename>', methods=['GET'])
def get_model_file(model_id, filename):
    try:
        response, status_code = FileService.get_model_file(model_id, filename)
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error listing model files: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/models/<model_id>/files/<path:filename>', methods=['DELETE'])
def delete_model_file(model_id, filename):
    try:
        response, status_code = FileService.delete_model_file(model_id, filename)
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error deleting model: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Embedding Routesid
@app.route('/api/models/<model_name>/embed', methods=['POST'])
def embed_documents(model_name):
    try:
        response, status_code =EmbeddingService.embed_documents(model_name)
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error embedding model: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/models/<model_id>/reembed', methods=['POST'])
def reembed_model(model_id):
    try:
        response, status_code = EmbeddingService.reembed_model(model_id)
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error re-embedding model: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Chat Routes
@app.route('/api/ask', methods=['POST'])
def ask_question():
    try:
        data = request.get_json()
        question = data.get('question')
        model_name = data.get('model_name')
        
        if not question or not model_name:
            return jsonify({"error": "Question and model_name are required"}), 400
            
        response, status_code = ChatService.ask_question(model_name, question)
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error asking question: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_chat_history():
    try:
        response, status_code = ChatService.get_chat_history()
        return jsonify(response), status_code
    except Exception as e:
        logger.error(f"Error getting chat history: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Error Handler
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

if __name__ == '__main__':
   socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
 