from PyPDF2 import PdfReader
import re

def process_pdf(filepath):
    reader = PdfReader(filepath)
    text = ""
    
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            # Nettoyage basique du texte
            page_text = re.sub(r'\s+', ' ', page_text).strip()
            text += page_text + "\n\n"
    
    return text