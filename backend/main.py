# This file is no longer needed for PyScript/Live Server setup.
# All logic should be moved to pyscript/main_pyscript.py and imported via <py-script> in HTML.
import os
import uuid
import json
from werkzeug.utils import secure_filename
import cv2
import numpy as np
from datetime import datetime
import base64
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
# Import our custom modules
from asl_recognition import ASLRecognition
from t5 import T5ASLTranslator

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'webm', 'mkv'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize models
asl_recognizer = None
translator = None

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def initialize_models():
    """Initialize ASL recognition and translation models"""
    global asl_recognizer, translator
    
    try:
        print("Initializing ASL Recognition model...")
        asl_recognizer = ASLRecognition()
        print("ASL Recognition model initialized successfully")
        
        print("Initializing T5 Translation model...")
        translator = T5ASLTranslator()
        print("T5 Translation model initialized successfully")
        
        return True
    except Exception as e:
        print(f"Error initializing models: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': {
            'asl_recognition': asl_recognizer is not None,
            't5_translation': translator is not None
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/models/status', methods=['GET'])
def model_status():
    """Get detailed model status"""
    return jsonify({
        'asl_recognition': {
            'loaded': asl_recognizer is not None,
            'type': 'MediaPipe + CNN',
            'capabilities': ['hand_detection', 'gesture_recognition', 'video_processing']
        },
        't5_translation': {
            'loaded': translator is not None,
            'type': 'T5-Base',
            'capabilities': ['asl_to_english', 'batch_translation', 'translation_suggestions']
        }
    })

@app.route('/upload', methods=['POST'])
def upload_video():
    """Upload and process ASL video"""
    try:
        # Check if file was uploaded
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large'}), 400
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        new_filename = f"{file_id}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, new_filename)
        
        # Save file
        file.save(file_path)
        
        # Process video for ASL recognition
        if asl_recognizer is None:
            return jsonify({'error': 'ASL recognition model not loaded'}), 500
        
        print(f"Processing video: {file_path}")
        
        # Extract ASL sequence
        asl_sequence = asl_recognizer.get_asl_sequence(file_path)
        
        if not asl_sequence:
            return jsonify({
                'error': 'No ASL gestures detected in video',
                'file_id': file_id,
                'filename': filename
            }), 400
        
        # Translate ASL to English
        if translator is None:
            return jsonify({'error': 'Translation model not loaded'}), 500
        
        translation_result = translator.translate_asl_to_english(asl_sequence)
        
        if not translation_result['success']:
            return jsonify({
                'error': f'Translation failed: {translation_result["error"]}',
                'file_id': file_id,
                'asl_sequence': asl_sequence
            }), 500
        
        # Get additional translation suggestions
        suggestions = translator.get_translation_suggestions(asl_sequence, 3)
        
        # Prepare response
        result = {
            'success': True,
            'file_id': file_id,
            'filename': filename,
            'file_size': file_size,
            'upload_time': datetime.now().isoformat(),
            'asl_recognition': {
                'sequence': asl_sequence,
                'confidence': 0.85  # Placeholder confidence
            },
            'translation': {
                'english_text': translation_result['translation'],
                'confidence': translation_result['confidence'],
                'suggestions': suggestions
            },
            'processing_time': 0  # Placeholder for actual processing time
        }
        
        # Save result to file for later retrieval
        result_file = os.path.join(UPLOAD_FOLDER, f"{file_id}_result.json")
        with open(result_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error processing video: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/video/<file_id>', methods=['GET'])
def get_video(file_id):
    """Get uploaded video by ID"""
    try:
        # Find video file
        for filename in os.listdir(UPLOAD_FOLDER):
            if filename.startswith(file_id) and '.' in filename:
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                return send_file(file_path, mimetype='video/mp4')
        
        return jsonify({'error': 'Video not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/result/<file_id>', methods=['GET'])
def get_result(file_id):
    """Get processing result by file ID"""
    try:
        result_file = os.path.join(UPLOAD_FOLDER, f"{file_id}_result.json")
        
        if not os.path.exists(result_file):
            return jsonify({'error': 'Result not found'}), 404
        
        with open(result_file, 'r') as f:
            result = json.load(f)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/translate', methods=['POST'])
def translate_text():
    """Translate ASL text to English"""
    try:
        data = request.get_json()
        
        if not data or 'asl_text' not in data:
            return jsonify({'error': 'ASL text not provided'}), 400
        
        asl_text = data['asl_text']
        
        if translator is None:
            return jsonify({'error': 'Translation model not loaded'}), 500
        
        # Translate ASL text
        translation_result = translator.translate_asl_to_english(asl_text)
        
        if not translation_result['success']:
            return jsonify({'error': translation_result['error']}), 500
        
        # Get suggestions
        suggestions = translator.get_translation_suggestions(asl_text, 3)
        
        result = {
            'success': True,
            'asl_text': asl_text,
            'translation': translation_result['translation'],
            'confidence': translation_result['confidence'],
            'suggestions': suggestions
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch_translate', methods=['POST'])
def batch_translate():
    """Translate multiple ASL texts"""
    try:
        data = request.get_json()
        
        if not data or 'asl_texts' not in data:
            return jsonify({'error': 'ASL texts not provided'}), 400
        
        asl_texts = data['asl_texts']
        
        if not isinstance(asl_texts, list):
            return jsonify({'error': 'ASL texts must be a list'}), 400
        
        if translator is None:
            return jsonify({'error': 'Translation model not loaded'}), 500
        
        # Batch translate
        results = translator.batch_translate(asl_texts)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/files', methods=['GET'])
def list_files():
    """List all uploaded files and their results"""
    try:
        files = []
        
        for filename in os.listdir(UPLOAD_FOLDER):
            if filename.endswith('_result.json'):
                # This is a result file
                file_id = filename.replace('_result.json', '')
                result_file = os.path.join(UPLOAD_FOLDER, filename)
                
                try:
                    with open(result_file, 'r') as f:
                        result = json.load(f)
                    
                    # Find corresponding video file
                    video_file = None
                    for vf in os.listdir(UPLOAD_FOLDER):
                        if vf.startswith(file_id) and not vf.endswith('_result.json'):
                            video_file = vf
                            break
                    
                    files.append({
                        'file_id': file_id,
                        'video_file': video_file,
                        'result': result
                    })
                    
                except Exception as e:
                    print(f"Error reading result file {filename}: {e}")
                    continue
        
        return jsonify({
            'success': True,
            'files': files
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete uploaded video and its result"""
    try:
        deleted_files = []
        
        # Find and delete all files with this ID
        for filename in os.listdir(UPLOAD_FOLDER):
            if filename.startswith(file_id):
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                try:
                    os.remove(file_path)
                    deleted_files.append(filename)
                except Exception as e:
                    print(f"Error deleting {filename}: {e}")
        
        if not deleted_files:
            return jsonify({'error': 'No files found with this ID'}), 404
        
        return jsonify({
            'success': True,
            'deleted_files': deleted_files
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ensure Flask server is running and endpoints are available:
#   - POST /upload (for video upload and translation)
#   - GET /health (for health check)
#   - etc.

if __name__ == '__main__':
    print("Starting ASL Translator Backend...")
    
    # Initialize models
    if initialize_models():
        print("All models loaded successfully!")
        print("Starting Flask server...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("Failed to initialize models. Exiting...")
        exit(1)

