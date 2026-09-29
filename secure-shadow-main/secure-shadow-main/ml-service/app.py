from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.gan_stego import GANSteganography
from services.deep_stego import DeepSteganography
from services.steganalysis import SteganalysisDetector
import io

load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv('CORS_ORIGIN', 'http://localhost:8080'))

# Initialize services
gan_stego = GANSteganography()
deep_stego = DeepSteganography()
steganalysis = SteganalysisDetector()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ml-steganography'})

@app.route('/api/ml/embed/gan', methods=['POST'])
def embed_gan():
    """
    Embed data using GAN-based steganography
    More secure and harder to detect
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        if 'data' not in request.form:
            return jsonify({'error': 'No data provided'}), 400
        
        image_file = request.files['image']
        data = request.form['data']
        
        # Embed using GAN
        result_image = gan_stego.embed(image_file, data)
        
        # Return as image
        img_io = io.BytesIO()
        result_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png', as_attachment=True, 
                        download_name='secured-gan.png')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/extract/gan', methods=['POST'])
def extract_gan():
    """
    Extract data using GAN-based steganography
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        
        # Extract using GAN
        extracted_data = gan_stego.extract(image_file)
        
        return jsonify({
            'success': True,
            'data': extracted_data,
            'length': len(extracted_data)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/embed/deep', methods=['POST'])
def embed_deep():
    """
    Embed data using deep learning encoder-decoder
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        if 'data' not in request.form:
            return jsonify({'error': 'No data provided'}), 400
        
        image_file = request.files['image']
        data = request.form['data']
        
        # Embed using deep learning
        result_image = deep_stego.embed(image_file, data)
        
        img_io = io.BytesIO()
        result_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png', as_attachment=True,
                        download_name='secured-deep.png')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/extract/deep', methods=['POST'])
def extract_deep():
    """
    Extract data using deep learning decoder
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        
        # Extract using deep learning
        extracted_data = deep_stego.extract(image_file)
        
        return jsonify({
            'success': True,
            'data': extracted_data,
            'length': len(extracted_data)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/analyze', methods=['POST'])
def analyze_steganalysis():
    """
    Detect if an image contains hidden data
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        
        # Analyze image
        result = steganalysis.detect(image_file)
        
        return jsonify({
            'success': True,
            'hasHiddenData': result['has_hidden_data'],
            'confidence': result['confidence'],
            'method': result['detected_method'],
            'details': result['details']
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/quality', methods=['POST'])
def assess_quality():
    """
    Assess image quality after embedding
    """
    try:
        if 'original' not in request.files or 'modified' not in request.files:
            return jsonify({'error': 'Both original and modified images required'}), 400
        
        original = request.files['original']
        modified = request.files['modified']
        
        # Calculate quality metrics
        metrics = steganalysis.calculate_quality_metrics(original, modified)
        
        return jsonify({
            'success': True,
            'metrics': metrics
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'False') == 'True')
