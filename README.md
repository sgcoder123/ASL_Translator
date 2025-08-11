# ASL Translator with MoviNet and T5

A powerful ASL (American Sign Language) translation system that combines MoviNet for video understanding, MediaPipe for hand detection, and T5 for natural language translation.

## Features

- **MoviNet Integration**: Advanced video understanding and temporal feature extraction
- **MediaPipe Hand Detection**: Real-time hand landmark detection and tracking
- **T5 Translation Model**: Pre-trained language model for ASL to English translation
- **Real-time Processing**: Upload videos or process live camera feed
- **Modern Web Interface**: Beautiful, responsive UI with drag-and-drop support
- **Multi-format Support**: MP4, AVI, MOV, WebM, and MKV video formats

## Architecture

```
Frontend (HTML/CSS/JS) → Backend (Flask) → AI Models
                                    ├── MoviNet (Video Understanding)
                                    ├── MediaPipe (Hand Detection)
                                    └── T5 (Language Translation)
```

## Prerequisites

- Python 3.8+
- CUDA-compatible GPU (optional, for faster processing)
- 4GB+ RAM
- 2GB+ free disk space

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ASL_Translator.git
cd ASL_Translator
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run setup script (downloads models and creates directories)
python setup.py

# Start the backend server
python main.py
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Open index.html in your web browser
# Or serve with a local server:
python -m http.server 8000
```

## Usage

### Video Upload

1. Open the web interface
2. Click "Start Translating"
3. Drag and drop your ASL video or click to browse
4. Wait for AI processing (MoviNet + MediaPipe + T5)
5. View the English translation

### Supported Video Formats

- MP4
- AVI
- MOV
- WebM
- MKV

### File Size Limits

- Maximum file size: 100MB
- Recommended resolution: 720p or higher
- Recommended duration: 5-60 seconds

## API Endpoints

### Health Check
```
GET /health
```

### Upload Video
```
POST /upload
Content-Type: multipart/form-data
Body: video file
```

### Model Status
```
GET /models/status
```

### MoviNet Information
```
GET /movinet/info
```

## Model Details

### MoviNet
- **Purpose**: Video understanding and temporal feature extraction
- **Input**: Video frames (3, 16, 224, 224)
- **Features**: Motion intensity, temporal consistency, spatial complexity
- **Output**: Enhanced ASL gesture analysis

### MediaPipe Hands
- **Purpose**: Hand landmark detection and tracking
- **Features**: 21 3D landmarks per hand
- **Confidence**: 70% detection, 50% tracking thresholds
- **Output**: Hand position and movement data

### T5 Model
- **Purpose**: ASL description to English translation
- **Model**: t5-base (12-layer, 768-hidden, 12-heads)
- **Input**: ASL gesture descriptions
- **Output**: Natural English text

## Development

### Project Structure

```
ASL_Translator/
├── backend/
│   ├── main.py                 # Main Flask application
│   ├── movinet_integration.py  # MoviNet video processor
│   ├── requirements.txt        # Python dependencies
│   ├── setup.py               # Setup and model download script
│   └── uploads/               # Temporary video storage
├── frontend/
│   ├── index.html             # Main web interface
│   ├── script.js              # Frontend logic
│   └── styles.css             # Styling
└── README.md                  # This file
```

### Adding Custom Models

1. **Custom T5 Model**: Update `load_t5_model()` in `main.py`
2. **Custom MoviNet**: Extend `MoviNetASLProcessor` class
3. **Custom Hand Detection**: Modify MediaPipe configuration

### Performance Optimization

- **GPU Acceleration**: Enable CUDA for PyTorch models
- **Batch Processing**: Process multiple frames simultaneously
- **Model Quantization**: Use INT8 models for faster inference
- **Frame Sampling**: Reduce frames for longer videos

## Troubleshooting

### Common Issues

1. **Models Not Loading**
   - Check internet connection for model downloads
   - Verify sufficient disk space
   - Check Python version compatibility

2. **Video Processing Errors**
   - Ensure video format is supported
   - Check file size limits
   - Verify video file integrity

3. **Performance Issues**
   - Enable GPU acceleration if available
   - Reduce video resolution
   - Close other applications

### Logs

Check backend logs for detailed error information:
```bash
cd backend
python main.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **MoviNet**: Google Research for video understanding
- **MediaPipe**: Google for hand detection
- **T5**: Google Research for language models
- **OpenCV**: Computer vision library
- **PyTorch**: Deep learning framework

## Support

For questions and support:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

## Roadmap

- [ ] Real-time camera feed processing
- [ ] Support for more sign languages
- [ ] Mobile app development
- [ ] Cloud deployment options
- [ ] Advanced gesture recognition
- [ ] Multi-person signing support
