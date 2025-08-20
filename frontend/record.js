// Camera and recording logic for record.html

let cameraFeed, startCameraBtn, cameraOverlay, recordBtn, saveBtn, recordControls, recordingStatus;
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

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

// Add cleanup function for when page is unloaded
window.addEventListener('beforeunload', function() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
});
