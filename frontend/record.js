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
        startRecording();
    } else {
        stopRecording();
    }
}

function startRecording() {
    if (!mediaStream) return;
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = function() {
        saveBtn.style.display = 'inline-flex';
        recordBtn.innerHTML = '<i class="fas fa-circle"></i> Start Recording';
        recordingStatus.textContent = 'Recording stopped.';
        isRecording = false;
    };
    mediaRecorder.start();
    isRecording = true;
    recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
    saveBtn.style.display = 'none';
    recordingStatus.textContent = 'Recording...';
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
    }
}

function saveVideo() {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const reader = new FileReader();
    reader.onloadend = function() {
        const base64data = reader.result;
        // Save to localStorage as a dashboard entry
        let videos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
        const id = 'vid_' + Date.now();
        videos.push({
            id,
            name: `ASL Recording ${new Date().toLocaleString()}`,
            date: new Date().toLocaleString(),
            video: base64data
        });
        localStorage.setItem('dashboardVideos', JSON.stringify(videos));
        recordingStatus.textContent = 'Saved to dashboard! Redirecting...';
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1200);
    };
    reader.readAsDataURL(blob);
}
