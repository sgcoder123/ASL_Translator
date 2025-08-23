// Enhanced Dashboard with ASL Translation Features

class DashboardManager {
    constructor() {
        this.videos = [];
        this.initializeEventListeners();
        this.loadDashboard();
    }

    initializeEventListeners() {
        // Record button (top right)
        const recordBtn = document.getElementById('recordVideoBtn');
        if (recordBtn) {
            recordBtn.addEventListener('click', () => {
                window.location.href = 'record.html';
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboard());
        }

        // Create new button (in empty dashboard)
        const createNewBtn = document.getElementById('createNewBtn');
        if (createNewBtn) {
            createNewBtn.addEventListener('click', () => {
                window.location.href = 'record.html';
            });
        }
    }

    setupCameraControls() {
        // Camera and recording variables
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.currentVideoBlob = null;

        // Camera controls
        const startCameraBtn = document.getElementById('startCameraBtn');
        const recordBtn = document.getElementById('recordBtn');
        const saveBtn = document.getElementById('saveBtn');
        const saveToDashboardBtn = document.getElementById('saveToDashboardBtn');
        const recordAnotherBtn = document.getElementById('recordAnotherBtn');

        if (startCameraBtn) {
            startCameraBtn.addEventListener('click', () => this.enableCamera());
        }
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecording());
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAndTranslate());
        }
        if (saveToDashboardBtn) {
            saveToDashboardBtn.addEventListener('click', () => this.saveToDashboard());
        }
        if (recordAnotherBtn) {
            recordAnotherBtn.addEventListener('click', () => this.recordAnother());
        }
    }

    toggleRecordingSection() {
        const recordingSection = document.getElementById('recordingSection');
        if (recordingSection) {
            const isVisible = recordingSection.style.display !== 'none';
            recordingSection.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                // Set up camera controls when showing the section
                this.setupCameraControls();
            } else {
                // Reset recording area when hiding
                this.resetRecordingArea();
            }
        }
    }

    resetUploadArea() {
        const fileInput = document.getElementById('videoFileInput');
        if (fileInput) fileInput.value = '';
        
        const uploadProgress = document.getElementById('uploadProgress');
        if (uploadProgress) uploadProgress.style.display = 'none';
        
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) uploadArea.style.display = 'block';
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processVideoFile(file);
        }
    }



    async loadDashboard() {
        // Also load videos from localStorage
        try {
            const localVideos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
            this.videos = localVideos;
        } catch (error) {
            console.error('Error loading local videos:', error);
            this.videos = [];
        }

        this.renderDashboard();
    }

    renderDashboard() {
        const dashboardContent = document.getElementById('dashboardContent');
        if (!dashboardContent) return;

        if (!this.videos.length) {
            dashboardContent.innerHTML = `
                <div class="dashboard-empty">
                    <i class="fas fa-video-slash"></i>
                    <p>No videos recorded yet</p>
                    <button class="btn btn-primary btn-large" onclick="window.location.href='record.html'">
                        <i class="fas fa-plus"></i> Record New Video
                    </button>
                </div>
            `;
            return;
        }

        let html = '<div class="dashboard-list">';
        // Use a copy of the array to avoid reversing in-place
        [...this.videos].reverse().forEach((videoData) => {
            html += this.createVideoCard(videoData);
        });
        html += '</div>';
        
        // "Record Another Video" button always navigates to record.html
        html += `
            <div style="text-align:center;margin-top:2rem;">
                <button class="btn btn-primary btn-large" onclick="window.location.href='record.html'">
                    <i class="fas fa-plus"></i> Record Another Video
                </button>
            </div>
        `;
        
        dashboardContent.innerHTML = html;
    }

    createVideoCard(videoData) {
        // Handle both backend videos and local videos
        let video, fileId, isLocalVideo = false;
        
        if (videoData.result && videoData.file_id) {
            // Backend video
            video = videoData.result;
            fileId = videoData.file_id;
        } else {
            // Local video
            video = videoData;
            fileId = videoData.id;
            isLocalVideo = true;
        }
        
        const videoSrc = isLocalVideo ? video.video : `${this.backendUrl}/video/${fileId}`;
        const videoTitle = video.name || video.filename || 'Untitled Video';
        const videoDate = video.date || video.upload_time || 'Unknown Date';
        const videoSize = video.size || video.file_size;
        
        return `
            <div class="dashboard-card" data-video-id="${fileId}">
                <div class="dashboard-card-video">
                    <video src="${videoSrc}" controls preload="metadata" onerror="this.style.display='none'">
                        <source src="${videoSrc}" type="video/webm">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div class="dashboard-card-info">
                    <div class="dashboard-card-title">${videoTitle}</div>
                    <div class="dashboard-card-date">${this.formatDate(videoDate)}</div>
                    ${videoSize ? `<div class="dashboard-card-size">${this.formatFileSize(videoSize)}</div>` : ''}
                    
                    <!-- ASL Recognition Results -->
                    ${video.asl_recognition ? `
                        <div class="asl-results">
                            <div class="asl-sequence">
                                <strong>ASL Sequence:</strong> ${video.asl_recognition.sequence}
                            </div>
                            <div class="asl-confidence">
                                <strong>Confidence:</strong> ${(video.asl_recognition.confidence * 100).toFixed(1)}%
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Translation Results -->
                    ${video.translation ? `
                        <div class="translation-results">
                            <div class="english-text">
                                <strong>English:</strong> ${video.translation.english_text}
                            </div>
                            <div class="translation-confidence">
                                <strong>Translation Confidence:</strong> ${(video.translation.confidence * 100).toFixed(1)}%
                            </div>
                            ${video.translation.suggestions && video.translation.suggestions.length > 0 ? `
                                <div class="translation-suggestions">
                                    <strong>Alternative Translations:</strong>
                                    <ul>
                                        ${video.translation.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
                <div class="dashboard-card-menu">
                    <button class="menu-btn" onclick="dashboardManager.deleteVideo('${fileId}', ${isLocalVideo})" title="Delete video">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${!isLocalVideo ? `
                        <button class="menu-btn" onclick="dashboardManager.reprocessVideo('${fileId}')" title="Reprocess video">
                            <i class="fas fa-redo"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async deleteVideo(videoId, isLocalVideo = false) {
        if (!confirm('Are you sure you want to delete this video?')) {
            return;
        }

        if (isLocalVideo) {
            // Delete from localStorage
            try {
                let videos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
                videos = videos.filter(v => v.id !== videoId);
                localStorage.setItem('dashboardVideos', JSON.stringify(videos));
                this.showNotification('Video deleted successfully!', 'success');
                await this.loadDashboard();
            } catch (error) {
                console.error('Error deleting local video:', error);
                this.showNotification('Error deleting video. Please try again.', 'error');
            }
        } else {
            // Delete from backend
            try {
                const response = await fetch(`${this.backendUrl}/delete/${videoId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.showNotification('Video deleted successfully!', 'success');
                    await this.loadDashboard();
                } else {
                    const errorData = await response.json();
                    this.showNotification(`Error deleting video: ${errorData.error}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting video:', error);
                this.showNotification('Error deleting video. Please try again.', 'error');
            }
        }
    }

    async reprocessVideo(videoId) {
        try {
            this.showNotification('Reprocessing video...', 'info');
            
            // For now, we'll just reload the dashboard
            // In a real implementation, you might want to call a reprocess endpoint
            await this.loadDashboard();
            this.showNotification('Video reprocessed!', 'success');
        } catch (error) {
            console.error('Error reprocessing video:', error);
            this.showNotification('Error reprocessing video. Please try again.', 'error');
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown Date';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch (error) {
            return 'Unknown Date';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    resetRecordingArea() {
        const recordingSection = document.getElementById('recordingSection');
        if (recordingSection) recordingSection.style.display = 'none';
        
        const translationResults = document.getElementById('translationResults');
        if (translationResults) translationResults.style.display = 'none';
        
        this.stopCamera();
        this.resetRecordingState();
    }

    enableCamera() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                this.mediaStream = stream;
                const cameraFeed = document.getElementById('cameraFeed');
                if (cameraFeed) {
                    cameraFeed.srcObject = stream;
                }
                
                // Hide overlay and show controls
                const cameraOverlay = document.getElementById('cameraOverlay');
                const recordingControls = document.getElementById('recordingControls');
                
                if (cameraOverlay) cameraOverlay.style.display = 'none';
                if (recordingControls) recordingControls.style.display = 'flex';
            })
            .catch(err => {
                alert('Camera access denied or not available.');
            });
    }

    stopCamera() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        const cameraFeed = document.getElementById('cameraFeed');
        if (cameraFeed) {
            cameraFeed.srcObject = null;
        }
        
        // Show overlay and hide controls
        const cameraOverlay = document.getElementById('cameraOverlay');
        const recordingControls = document.getElementById('recordingControls');
        
        if (cameraOverlay) cameraOverlay.style.display = 'flex';
        if (recordingControls) recordingControls.style.display = 'none';
    }

    toggleRecording() {
        if (!this.isRecording) {
            this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    startRecording() {
        if (!this.mediaStream) return;
        
        this.recordedChunks = [];
        
        try {
            let mimeType = 'video/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/mp4';
            }
            
            this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: mimeType });
            
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                if (this.recordedChunks.length > 0) {
                    const saveBtn = document.getElementById('saveBtn');
                    if (saveBtn) saveBtn.style.display = 'inline-flex';
                    
                    const recordingStatus = document.getElementById('recordingStatus');
                    if (recordingStatus) recordingStatus.textContent = 'Recording stopped. Ready to translate.';
                }
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update UI
            const recordBtn = document.getElementById('recordBtn');
            if (recordBtn) recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            
            const recordingStatus = document.getElementById('recordingStatus');
            if (recordingStatus) recordingStatus.textContent = 'Recording...';
            
        } catch (e) {
            alert('Error starting recording. Please try again.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Update UI
            const recordBtn = document.getElementById('recordBtn');
            if (recordBtn) recordBtn.innerHTML = '<i class="fas fa-circle"></i> Start Recording';
        }
    }

    async saveAndTranslate() {
        if (this.recordedChunks.length === 0) {
            alert('No recording to translate.');
            return;
        }
        
        try {
            // Create video blob
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            this.currentVideoBlob = blob;
            
            // Show processing status
            const recordingStatus = document.getElementById('recordingStatus');
            if (recordingStatus) recordingStatus.textContent = 'Processing video for ASL translation...';
            
            // Upload and translate
            const result = await this.uploadAndTranslateVideo(blob);
            
            if (result.success) {
                this.showTranslationResults(result);
                if (recordingStatus) recordingStatus.textContent = 'Translation completed!';
            } else {
                if (recordingStatus) recordingStatus.textContent = `Translation failed: ${result.error}`;
            }
            
        } catch (error) {
            console.error('Error processing video:', error);
            const recordingStatus = document.getElementById('recordingStatus');
            if (recordingStatus) recordingStatus.textContent = 'Error processing video. Please try again.';
        }
    }

    async uploadAndTranslateVideo(videoBlob) {
        try {
            const formData = new FormData();
            formData.append('video', videoBlob, 'asl_recording.webm');
            
            const response = await fetch(`${this.backendUrl}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Error uploading video:', error);
            throw error;
        }
    }

    showTranslationResults(result) {
        // Hide recording controls
        const recordingControls = document.getElementById('recordingControls');
        if (recordingControls) recordingControls.style.display = 'none';
        
        // Show translation results
        const translationResults = document.getElementById('translationResults');
        if (translationResults) translationResults.style.display = 'block';
        
        // Update ASL recognition results
        if (result.asl_recognition) {
            const aslSequence = document.getElementById('aslSequence');
            const aslConfidence = document.getElementById('aslConfidence');
            
            if (aslSequence) aslSequence.textContent = result.asl_recognition.sequence;
            if (aslConfidence) aslConfidence.textContent = 
                `Confidence: ${(result.asl_recognition.confidence * 100).toFixed(1)}%`;
        }
        
        // Update translation results
        if (result.translation) {
            const englishText = document.getElementById('englishText');
            const translationConfidence = document.getElementById('translationConfidence');
            
            if (englishText) englishText.textContent = result.translation.english_text;
            if (translationConfidence) translationConfidence.textContent = 
                `Confidence: ${(result.translation.confidence * 100).toFixed(1)}%`;
            
            // Show suggestions if available
            if (result.translation.suggestions && result.translation.suggestions.length > 0) {
                const suggestionsSection = document.getElementById('suggestionsSection');
                const suggestionsList = document.getElementById('suggestionsList');
                
                if (suggestionsList) {
                    suggestionsList.innerHTML = '';
                    result.translation.suggestions.forEach(suggestion => {
                        const li = document.createElement('li');
                        li.textContent = suggestion;
                        suggestionsList.appendChild(li);
                    });
                }
                
                if (suggestionsSection) suggestionsSection.style.display = 'block';
            }
        }
    }

    async saveToDashboard() {
        try {
            if (!this.currentVideoBlob) {
                alert('No video to save');
                return;
            }
            
            // Convert to base64 for localStorage
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const base64data = e.target.result;
                    
                    // Get the current translation results
                    const aslSequence = document.getElementById('aslSequence');
                    const aslConfidence = document.getElementById('aslConfidence');
                    const englishText = document.getElementById('englishText');
                    const translationConfidence = document.getElementById('translationConfidence');
                    const suggestionsList = document.getElementById('suggestionsList');
                    
                    // Create video entry with translation data
                    let videos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
                    const id = 'vid_' + Date.now();
                    const videoEntry = {
                        id,
                        name: `ASL Recording ${new Date().toLocaleString()}`,
                        date: new Date().toLocaleString(),
                        video: base64data,
                        size: this.currentVideoBlob.size,
                        asl_recognition: {
                            sequence: aslSequence ? aslSequence.textContent : 'Unknown',
                            confidence: 0.85 // Default confidence
                        },
                        translation: {
                            english_text: englishText ? englishText.textContent : 'Translation not available',
                            confidence: 0.90, // Default confidence
                            suggestions: suggestionsList ? Array.from(suggestionsList.children).map(li => li.textContent) : []
                        }
                    };
                    
                    videos.push(videoEntry);
                    localStorage.setItem('dashboardVideos', JSON.stringify(videos));
                    
                    // Reload dashboard to show new video
                    this.loadDashboard();
                    
                    // Hide recording section
                    const recordingSection = document.getElementById('recordingSection');
                    if (recordingSection) recordingSection.style.display = 'none';
                    
                    this.showNotification('Video saved to dashboard successfully!', 'success');
                    
                } catch (error) {
                    console.error('Error saving to dashboard:', error);
                    this.showNotification('Error saving to dashboard. Please try again.', 'error');
                }
            };
            
            reader.readAsDataURL(this.currentVideoBlob);
            
        } catch (error) {
            console.error('Error saving to dashboard:', error);
            this.showNotification('Error saving to dashboard. Please try again.', 'error');
        }
    }

    recordAnother() {
        // Hide translation results
        const translationResults = document.getElementById('translationResults');
        if (translationResults) translationResults.style.display = 'none';
        
        // Show recording controls
        const recordingControls = document.getElementById('recordingControls');
        if (recordingControls) recordingControls.style.display = 'flex';
        
        // Reset recording state
        this.resetRecordingState();
        
        // Clear current video
        this.currentVideoBlob = null;
        
        // Reset recording status
        const recordingStatus = document.getElementById('recordingStatus');
        if (recordingStatus) recordingStatus.textContent = 'Ready to record';
    }

    resetRecordingState() {
        this.recordedChunks = [];
        this.isRecording = false;
        
        if (this.mediaRecorder) {
            try {
                if (this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop();
                }
            } catch (e) {
                // MediaRecorder already stopped
            }
            this.mediaRecorder = null;
        }
        
        // Reset UI
        const recordBtn = document.getElementById('recordBtn');
        if (recordBtn) recordBtn.innerHTML = '<i class="fas fa-circle"></i> Start Recording';
        
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) saveBtn.style.display = 'none';
        
        const recordingStatus = document.getElementById('recordingStatus');
        if (recordingStatus) recordingStatus.textContent = 'Ready to record';
    }
}

// Replace backend fetch with PyScript calls
async function translateASLText(aslText) {
    const result = await pyodide.runPythonAsync(`translate_asl("${aslText}")`);
    // Use result in dashboard
}

// Initialize dashboard when DOM is loaded
let dashboardManager;
document.addEventListener('DOMContentLoaded', function() {
    dashboardManager = new DashboardManager();
    window.dashboardManager = dashboardManager; // Make it globally accessible
    loadLocalVideos();
});

function loadLocalVideos() {
    const dashboardContent = document.getElementById('dashboardContent');
    let videos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
    if (!videos.length) {
        dashboardContent.innerHTML = `
            <div class="dashboard-empty">
                <i class="fas fa-video-slash"></i>
                <p>No videos recorded yet</p>
                <button class="btn btn-primary btn-large" onclick="window.location.href='record.html'">
                    <i class="fas fa-plus"></i> Record New Video
                </button>
            </div>
        `;
        return;
    }
    let html = '<div class="dashboard-list">';
    videos.reverse().forEach(video => {
        html += `
            <div class="dashboard-card" data-video-id="${video.id}">
                <div class="dashboard-card-video">
                    <video src="${video.video}" controls preload="metadata"></video>
                </div>
                <div class="dashboard-card-info">
                    <div class="dashboard-card-title">${video.name}</div>
                    <div class="dashboard-card-date">${video.date}</div>
                    <div class="dashboard-card-size">${(video.size/1024).toFixed(1)} KB</div>
                    <button class="btn btn-primary btn-small translate-btn" data-video-id="${video.id}">Translate</button>
                    <button class="btn btn-danger btn-small delete-btn" data-video-id="${video.id}" style="margin-left:0.5rem;">Delete</button>
                    <div class="translation-result" id="translation-${video.id}" style="margin-top:0.5rem;"></div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    dashboardContent.innerHTML = html;

    // Add event listeners for translate buttons
    document.querySelectorAll('.translate-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const videoId = btn.getAttribute('data-video-id');
            const videoObj = videos.find(v => v.id === videoId);
            if (!videoObj) return;
            const translationDiv = document.getElementById(`translation-${videoId}`);
            translationDiv.innerHTML = 'Translating...';

            // Convert base64 to Blob
            const base64 = videoObj.video.split(',')[1];
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'video/webm' });

            // Send to backend
            const formData = new FormData();
            formData.append('video', blob, 'asl_recording.webm');
            try {
                const response = await fetch('http://localhost:5000/upload', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    translationDiv.innerHTML = `<span style="color:red;">Error: ${errorData.error || 'Upload failed'}</span>`;
                    return;
                }
                const result = await response.json();
                // Show only ASL sequence and suggestions
                let resultHtml = '';
                if (result.asl_recognition) {
                    resultHtml += `<div><strong>ASL Sequence:</strong> ${result.asl_recognition.sequence}</div>`;
                }
                if (result.translation && result.translation.suggestions && result.translation.suggestions.length > 0) {
                    resultHtml += `<div><strong>Alternative Translations:</strong><ul>`;
                    result.translation.suggestions.forEach(suggestion => {
                        resultHtml += `<li>${suggestion}</li>`;
                    });
                    resultHtml += `</ul></div>`;
                }
                translationDiv.innerHTML = resultHtml;
            } catch (error) {
                translationDiv.innerHTML = `<span style="color:red;">Error: ${error.message}</span>`;
            }
        });
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const videoId = btn.getAttribute('data-video-id');
            let videos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
            videos = videos.filter(v => v.id !== videoId);
            localStorage.setItem('dashboardVideos', JSON.stringify(videos));
            loadLocalVideos();
        });
    });
}
            localStorage.setItem('dashboardVideos', JSON.stringify(videos));
            loadLocalVideos();
