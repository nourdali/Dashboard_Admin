import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # File upload
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt', 'xlsx', 'xml'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # Services

    MODEL_SERVICE_URL = os.getenv('MODEL_SERVICE_URL', 'http://localhost:8000')
   
    # Other
    REQUEST_TIMEOUT = 30
    DEFAULT_HEADERS = {'Content-Type': 'application/json'}

# Instance de configuration
settings = Config()