import io
import requests

try:
    from pypdf import PdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

class KnowledgeService:
    @staticmethod
    def extract_text_from_url(url):
        """Extract text from a URL (Supabase storage)"""
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            # Identify file type
            content_type = response.headers.get('Content-Type', '')
            file_extension = url.split('.')[-1].lower().split('?')[0] # Remove query params
            
            text = ""
            
            if ('pdf' in content_type or file_extension == 'pdf') and PYPDF_AVAILABLE:
                reader = PdfReader(io.BytesIO(response.content))
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            
            elif ('word' in content_type or file_extension in ['doc', 'docx']) and DOCX_AVAILABLE:
                doc = Document(io.BytesIO(response.content))
                for para in doc.paragraphs:
                    text += para.text + "\n"
            
            elif not PYPDF_AVAILABLE or not DOCX_AVAILABLE:
                text = "[Neural Knowledge Processor Installing... Basic Text Extraction Only]\n"
                text += response.content.decode('utf-8', errors='ignore')
            
            else:
                # Assume text/plain or similar
                text = response.content.decode('utf-8', errors='ignore')
                
            return text
        except Exception as e:
            print(f"Error extracting text from {url}: {e}")
            return ""

    @staticmethod
    def get_relevant_context(persona, query, top_n=3):
        """
        Gathers context from data_dump, life_data, and uploaded files.
        Simple keyword/relevance ranking for now.
        """
        potential_sources = []
        
        # 1. Add Data Dump
        if persona.get('data_dump'):
            potential_sources.append({
                'source': 'Deep Knowledge Base',
                'content': persona['data_dump']
            })
            
        # 2. Add Life Data
        if persona.get('life_data'):
            potential_sources.append({
                'source': 'Personal Life Records',
                'content': persona['life_data']
            })
            
        # 3. Add Uploaded Files (Process on the fly for small files)
        if persona.get('uploaded_files'):
            for file_item in persona['uploaded_files']:
                try:
                    # In a high-traffic app, we'd pre-extract this.
                    # For now, we extract context on-the-fly.
                    file_text = KnowledgeService.extract_text_from_url(file_item['url'])
                    if file_text:
                        potential_sources.append({
                            'source': f"File: {file_item.get('name', 'Attachment')}",
                            'content': file_text
                        })
                except: continue
        
        # Build searching logic
        relevant_snippets = []
        for src in potential_sources:
            # Split into chunks of ~800 chars
            chunks = [src['content'][i:i+1000] for i in range(0, len(src['content']), 800)]
            
            # Simple keyword match scoring
            query_words = set(query.lower().split())
            for chunk in chunks:
                # Count matching keywords
                score = sum(1 for word in query_words if word in chunk.lower())
                
                # Boost score if multiple unique keywords match
                if score > 0:
                    relevant_snippets.append({
                        'source': src['source'],
                        'content': chunk.strip(),
                        'score': score
                    })
        
        # Sort by score and return top
        relevant_snippets.sort(key=lambda x: x['score'], reverse=True)
        return relevant_snippets[:top_n]
