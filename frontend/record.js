// Camera and recording logic for record.html

let cameraFeed, startCameraBtn, cameraOverlay, recordBtn, saveBtn, recordControls, recordingStatus;
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let backendUrl = 'http://localhost:5000';
let currentVideoBlob = null;

document.addEventListener('DOMContentLoaded', function() {
    cameraFeed = document.getElementById('cameraFeed');
    startCameraBtn = document.getElementById('startCameraBtn');
    cameraOverlay = document.getElementById('cameraOverlay');
    recordBtn = document.getElementById('recordBtn');
    saveBtn = document.getElementById('saveBtn');
    recordControls = document.getElementById('recordControls');
    recordingStatus = document.getElementById('recordingStatus');

    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', enableCamera);
    }
    if (recordBtn) {
        recordBtn.addEventListener('click', toggleRecording);
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', saveVideo);
    }
});

function enableCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            mediaStream = stream;
            cameraFeed.srcObject = stream;
            cameraOverlay.style.display = 'none';
            recordControls.style.display = 'flex';
        })
        .catch(err => {
            alert('Camera access denied or not available.');
        });
}

function toggleRecording() {
    if (!isRecording) {
        // If there are unsaved chunks and we're starting a new recording, clear them
        if (recordedChunks.length > 0 && !saveBtn.style.display.includes('none')) {
            if (confirm('You have an unsaved recording. Start a new one anyway?')) {
                resetRecordingState();
            } else {
                return;
            }
        }
        startRecording();
    } else {
        stopRecording();
    }
}

function startRecording() {
    if (!mediaStream) return;
    
    // Reset any existing recording state
    if (mediaRecorder) {
        try {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        } catch (e) {
            console.log('MediaRecorder already stopped');
        }
        mediaRecorder = null;
    }
    
    recordedChunks = [];
    
    try {
        // Use the most compatible MIME type
        let mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
        }
        
        mediaRecorder = new MediaRecorder(mediaStream, { mimeType: mimeType });
        
        mediaRecorder.ondataavailable = function(e) {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
                console.log('Data chunk received:', e.data.size, 'bytes');
            }
        };
        
        mediaRecorder.onstop = function() {
            console.log('Recording stopped. Total chunks:', recordedChunks.length);
            if (recordedChunks.length > 0) {
                saveBtn.style.display = 'inline-flex';
                recordingStatus.textContent = 'Recording stopped. Ready to save.';
            } else {
                recordingStatus.textContent = 'Recording failed. Please try again.';
            }
            recordBtn.innerHTML = '<i class="fas fa-circle"></i> Start Recording';
            isRecording = false;
            
            // Remove recording visual indicator
            const cameraContainer = document.getElementById('cameraContainer');
            if (cameraContainer) {
                cameraContainer.classList.remove('recording');
            }
        };
        
        mediaRecorder.start();
        isRecording = true;
        recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
        saveBtn.style.display = 'none';
        recordingStatus.textContent = 'Recording...';
        
        // Add recording visual indicator
        const cameraContainer = document.getElementById('cameraContainer');
        if (cameraContainer) {
            cameraContainer.classList.add('recording');
        }
        
    } catch (error) {
        console.error('Error starting recording:', error);
        recordingStatus.textContent = 'Error starting recording. Please try again.';
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        console.log('Stopping recording...');
        mediaRecorder.stop();
        // Don't stop the media stream tracks here - keep the camera active
    }
}

function saveVideo() {
    console.log('Save video called. Chunks:', recordedChunks.length);
    
    if (recordedChunks.length === 0) {
        recordingStatus.textContent = 'No recording to save.';
        return;
    }
    
    // Show saving status
    recordingStatus.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    try {
        // Create blob with more flexible type handling
        let blob;
        try {
            blob = new Blob(recordedChunks, { type: 'video/webm' });
        } catch (blobError) {
            console.log('WebM failed, trying generic video type');
            blob = new Blob(recordedChunks, { type: 'video/*' });
        }
        
        console.log('Blob created successfully:', blob.size, 'bytes');
        
        // Convert to base64
        const reader = new FileReader();
        
        reader.onload = function() {
            try {
                const base64data = reader.result;
                console.log('Video converted to base64, length:', base64data.length);
                
                // Save to localStorage
                let videos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
                const id = 'vid_' + Date.now();
                const videoEntry = {
                    id,
                    name: `ASL Recording ${new Date().toLocaleString()}`,
                    date: new Date().toLocaleString(),
                    video: base64data,
                    size: blob.size
                };
                
                videos.push(videoEntry);
                localStorage.setItem('dashboardVideos', JSON.stringify(videos));
                
                console.log('Video saved to localStorage successfully');
                recordingStatus.textContent = 'Saved to dashboard! Redirecting...';
                
                // Reset recording state completely
                resetRecordingState();
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                
            } catch (error) {
                console.error('Error in onload callback:', error);
                recordingStatus.textContent = 'Error saving video. Please try again.';
                saveBtn.disabled = false;
            }
        };
        
        reader.onerror = function(error) {
            console.error('FileReader error:', error);
            recordingStatus.textContent = 'Error reading video data. Please try again.';
            saveBtn.disabled = false;
        };
        
        reader.readAsDataURL(blob);
        
    } catch (error) {
        console.error('Error in saveVideo function:', error);
        recordingStatus.textContent = 'Error creating video. Please try again.';
        saveBtn.disabled = false;
    }
}

// Add function to reset recording state
function resetRecordingState() {
    // Clear recorded chunks
    recordedChunks = [];
    
    // Reset mediaRecorder
    if (mediaRecorder) {
        try {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        } catch (e) {
            console.log('MediaRecorder already stopped');
        }
        mediaRecorder = null;
    }
    
    // Reset recording state
    isRecording = false;
    
    // Remove recording visual indicator
    const cameraContainer = document.getElementById('cameraContainer');
    if (cameraContainer) {
        cameraContainer.classList.remove('recording');
    }
    
    // Reset UI
    recordBtn.innerHTML = '<i class="fas fa-circle"></i> Start Recording';
    saveBtn.style.display = 'none';
    saveBtn.disabled = false;
    recordingStatus.textContent = 'Ready to record';
    
    console.log('Recording state reset successfully');
}

// New function to upload and translate video
async function uploadAndTranslateVideo(videoBlob) {
    try {
        // Create FormData for upload
        const formData = new FormData();
        formData.append('video', videoBlob, 'asl_recording.webm');
        
        // Upload to backend
        const response = await fetch(`${backendUrl}/upload`, {
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

// New function to show translation results
function showTranslationResults(result) {
    // Hide recording controls
    recordControls.style.display = 'none';
    
    // Show translation results
    const translationResults = document.getElementById('translationResults');
    translationResults.style.display = 'block';
    
    // Update ASL recognition results
    if (result.asl_recognition) {
        document.getElementById('aslSequence').textContent = result.asl_recognition.sequence;
        document.getElementById('aslConfidence').textContent = 
            `Confidence: ${(result.asl_recognition.confidence * 100).toFixed(1)}%`;
    }
    
    // Update translation results
    if (result.translation) {
        document.getElementById('englishText').textContent = result.translation.english_text;
        document.getElementById('translationConfidence').textContent = 
            `Confidence: ${(result.translation.confidence * 100).toFixed(1)}%`;
        
        // Show suggestions if available
        if (result.translation.suggestions && result.translation.suggestions.length > 0) {
            const suggestionsSection = document.getElementById('suggestionsSection');
            const suggestionsList = document.getElementById('suggestionsList');
            
            suggestionsList.innerHTML = '';
            result.translation.suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                suggestionsList.appendChild(li);
            });
            
            suggestionsSection.style.display = 'block';
        }
    }
    
    // Add event listeners for action buttons
    document.getElementById('saveToDashboardBtn').addEventListener('click', saveToDashboard);
    document.getElementById('recordAnotherBtn').addEventListener('click', recordAnother);
}

// New function to save to dashboard
async function saveToDashboard() {
    try {
        if (!currentVideoBlob) {
            alert('No video to save');
            return;
        }
        
        // Convert to base64 for localStorage
        const reader = new FileReader();
        reader.onload = function() {
            try {
                const base64data = reader.result;
                
                // Save to localStorage
                let videos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
                const id = 'vid_' + Date.now();
                const videoEntry = {
                    id,
                    name: `ASL Recording ${new Date().toLocaleString()}`,
                    date: new Date().toLocaleString(),
                    video: base64data,
                    size: currentVideoBlob.size
                };
                
                videos.push(videoEntry);
                localStorage.setItem('dashboardVideos', JSON.stringify(videos));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
                
            } catch (error) {
                console.error('Error saving to dashboard:', error);
                alert('Error saving to dashboard. Please try again.');
            }
        };
        
        reader.readAsDataURL(currentVideoBlob);
        
    } catch (error) {
        console.error('Error saving to dashboard:', error);
        alert('Error saving to dashboard. Please try again.');
    }
}

// New function to record another video
function recordAnother() {
    // Hide translation results
    document.getElementById('translationResults').style.display = 'none';
    
    // Show recording controls
    recordControls.style.display = 'flex';
    
    // Reset recording state
    resetRecordingState();
    
    // Clear current video
    currentVideoBlob = null;
    
    // Reset recording status
    recordingStatus.textContent = 'Ready to record';
}

// Add cleanup function for when page is unloaded
window.addEventListener('beforeunload', function() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
});
