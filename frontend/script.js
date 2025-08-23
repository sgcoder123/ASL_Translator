// DOM Elements
let startBtn, loginBtn, signupBtn;
let uploadSection, closeBtn, uploadArea, videoFileInput, videoPreview;
let uploadedVideo, videoFileName, videoFileSize, uploadBtn, changeVideoBtn;
let copyBtn, shareBtn, saveBtn, loadingOverlay, toast, translationResult;

// State Management
let selectedVideo = null;
let isProcessing = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM Content Loaded');
        initializeApp();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

function initializeApp() {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Add smooth scroll behavior for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active state to navigation
    window.addEventListener('scroll', updateActiveNav);
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Add entrance animations
    addEntranceAnimations();
}

function initializeDOMElements() {
    startBtn = document.getElementById('startBtn');
    loginBtn = document.getElementById('loginBtn');
    signupBtn = document.getElementById('signupBtn');
    
    uploadSection = document.getElementById('uploadSection');
    closeBtn = document.getElementById('closeBtn');
    uploadArea = document.getElementById('uploadArea');
    videoFileInput = document.getElementById('videoFileInput');
    videoPreview = document.getElementById('videoPreview');
    uploadedVideo = document.getElementById('uploadedVideo');
    videoFileName = document.getElementById('videoFileName');
    videoFileSize = document.getElementById('videoFileSize');
    uploadBtn = document.getElementById('uploadBtn');
    changeVideoBtn = document.getElementById('changeVideoBtn');
    copyBtn = document.getElementById('copyBtn');
    shareBtn = document.getElementById('shareBtn');
    saveBtn = document.getElementById('saveBtn');
    loadingOverlay = document.getElementById('loadingOverlay');
    toast = document.getElementById('toast');
    translationResult = document.getElementById('translationResult');
    
    // Debug: Check if elements are found
    console.log('DOM Elements initialized:', {
        startBtn: !!startBtn,
        uploadSection: !!uploadSection,
        uploadArea: !!uploadArea,
        videoFileInput: !!videoFileInput
    });
    
    // Debug: Log all elements
    console.log('All DOM elements:', {
        startBtn,
        uploadSection,
        uploadArea,
        videoFileInput,
        closeBtn,
        uploadBtn
    });
}

function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Start upload button
    if (startBtn) {
        console.log('Start button found, adding event listener');
        startBtn.addEventListener('click', () => {
            console.log('Start button clicked!');
            showUploadInterface();
            showToast('Upload interface opened!', 'success');
        });
    } else {
        console.error('Start button not found!');
    }

    // Login button
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            showToast('Login functionality coming soon!', 'info');
        });
    }

    // Signup button
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            showToast('Sign up functionality coming soon!', 'info');
        });
    }



    // Close upload interface
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideUploadInterface();
        });
    }

    // Upload area click
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            videoFileInput.click();
        });
    }

    // File input change
    if (videoFileInput) {
        videoFileInput.addEventListener('change', handleVideoSelection);
    }

    // Upload button
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handleVideoUpload);
    }

    // Change video button
    if (changeVideoBtn) {
        changeVideoBtn.addEventListener('click', resetVideoSelection);
    }

    // Drag and drop functionality
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('dragleave', handleDragLeave);
    }

    // Copy button
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyTranslation();
        });
    }

    // Share button
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            shareTranslation();
        });
    }

    // Save button
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveTranslation();
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function addEntranceAnimations() {
    // Add staggered animation to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * index);
    });

    // Add floating animation to hero hands
    const hands = document.querySelectorAll('.hand');
    hands.forEach((hand, index) => {
        hand.style.animationDelay = `${index * 2}s`;
    });
}

function showUploadInterface() {
    console.log('showUploadInterface called');
    console.log('uploadSection:', uploadSection);
    
    if (!uploadSection) {
        console.error('uploadSection is null!');
        return;
    }
    
    uploadSection.style.display = 'block';
    uploadSection.scrollIntoView({ behavior: 'smooth' });
    
    // Add entrance animation
    uploadSection.style.opacity = '0';
    uploadSection.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        uploadSection.style.transition = 'all 0.6s ease';
        uploadSection.style.opacity = '1';
        uploadSection.style.transform = 'translateY(0)';
    }, 100);
}

function hideUploadInterface() {
    uploadSection.style.transition = 'all 0.4s ease';
    uploadSection.style.opacity = '0';
    uploadSection.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        uploadSection.style.display = 'none';
        uploadSection.style.opacity = '1';
        uploadSection.style.transform = 'translateY(0)';
    }, 400);
}

// Video Upload Functions
function handleVideoSelection(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
        selectedVideo = file;
        displayVideoPreview(file);
        showToast('Video selected successfully!', 'success');
    } else {
        showToast('Please select a valid video file.', 'error');
    }
}

function displayVideoPreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedVideo.src = e.target.result;
        videoFileName.textContent = file.name;
        videoFileSize.textContent = formatFileSize(file.size);
        
        uploadArea.style.display = 'none';
        videoPreview.style.display = 'block';
        uploadBtn.style.display = 'inline-flex';
        changeVideoBtn.style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
}

function handleVideoUpload() {
    if (!selectedVideo) {
        showToast('Please select a video first!', 'warning');
        return;
    }
    
    isProcessing = true;
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    showLoading('Processing ASL video...');
    
    // Simulate processing delay
    setTimeout(() => {
        hideLoading();
        isProcessing = false;
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload & Translate';
        
        // Simulate translation result
        updateTranslationResult("Hello! This is a sample ASL translation result.");
        showToast('Video processed successfully!', 'success');
    }, 3000);
}

function resetVideoSelection() {
    selectedVideo = null;
    videoFileInput.value = '';
    uploadArea.style.display = 'block';
    videoPreview.style.display = 'none';
    uploadBtn.style.display = 'none';
    changeVideoBtn.style.display = 'none';
    
    // Reset translation result
    translationResult.innerHTML = `
        <div class="placeholder-text">
            <i class="fas fa-comments"></i>
            <p>Your translation will appear here</p>
        </div>
    `;
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
        videoFileInput.files = files;
        handleVideoSelection({ target: { files: files } });
    } else {
        showToast('Please drop a valid video file.', 'error');
    }
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    videoFeed.style.display = 'none';
    cameraPlaceholder.style.display = 'block';
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}

function toggleTranslation() {
    if (!stream) {
        showToast('Please enable camera first!', 'warning');
        return;
    }
    
    if (!isTranslating) {
        startTranslation();
    } else {
        stopTranslation();
    }
}

function startTranslation() {
    isTranslating = true;
    translateBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Translation';
    translateBtn.classList.remove('btn-primary');
    translateBtn.classList.add('btn-secondary');
    
    showToast('Translation started! Processing ASL...', 'success');
    
    // Start processing frames
    processFrame();
}

function stopTranslation() {
    isTranslating = false;
    translateBtn.innerHTML = '<i class="fas fa-language"></i> Translate';
    translateBtn.classList.remove('btn-secondary');
    translateBtn.classList.add('btn-primary');
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    
    showToast('Translation stopped!', 'info');
}

function processFrame() {
    if (!isTranslating || !stream) return;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
    
    // Here you would integrate with your Python backend
    // For now, we'll simulate processing
    simulateTranslation();
    
    if (isTranslating) {
        animationFrame = requestAnimationFrame(processFrame);
    }
}

function simulateTranslation() {
    // Simulate translation processing
    const sampleTranslations = [
        "Hello, how are you?",
        "Thank you very much",
        "Nice to meet you",
        "What is your name?",
        "I love learning ASL",
        "Have a great day!",
        "Please repeat that",
        "I understand now"
    ];
    
    // Randomly select a translation (simulating AI processing)
    if (Math.random() < 0.1) { // 10% chance to update
        const randomTranslation = sampleTranslations[Math.floor(Math.random() * sampleTranslations.length)];
        updateTranslationResult(randomTranslation);
    }
}

function updateTranslationResult(text) {
    translationResult.innerHTML = `
        <div class="translation-text">
            <i class="fas fa-language"></i>
            <p>${text}</p>
        </div>
    `;
    
    // Add typing animation
    const translationText = translationResult.querySelector('.translation-text p');
    translationText.style.opacity = '0';
    translationText.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        translationText.style.transition = 'all 0.3s ease';
        translationText.style.opacity = '1';
        translationText.style.transform = 'translateY(0)';
    }, 100);
}

function togglePause() {
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        pauseBtn.classList.remove('btn-secondary');
        pauseBtn.classList.add('btn-primary');
        showToast('Translation paused!', 'info');
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        pauseBtn.classList.remove('btn-primary');
        pauseBtn.classList.add('btn-secondary');
        showToast('Translation resumed!', 'success');
    }
}

function resetTranslation() {
    translationResult.innerHTML = `
        <div class="placeholder-text">
            <i class="fas fa-comments"></i>
            <p>Your translation will appear here</p>
        </div>
    `;
    
    showToast('Translation reset!', 'info');
}

function copyTranslation() {
    const text = translationResult.querySelector('p')?.textContent;
    if (text && text !== 'Your translation will appear here') {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Translation copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy translation', 'error');
        });
    } else {
        showToast('No translation to copy!', 'warning');
    }
}

function shareTranslation() {
    const text = translationResult.querySelector('p')?.textContent;
    if (text && text !== 'Your translation will appear here') {
        if (navigator.share) {
            navigator.share({
                title: 'Signbridge Translation',
                text: text,
                url: window.location.href
            }).then(() => {
                showToast('Translation shared!', 'success');
            }).catch(() => {
                showToast('Failed to share translation', 'error');
            });
        } else {
            copyTranslation();
        }
    } else {
        showToast('No translation to share!', 'warning');
    }
}

function saveTranslation() {
    const text = translationResult.querySelector('p')?.textContent;
    if (text && text !== 'Your translation will appear here') {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'signbridge-translation.txt';
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('Translation saved!', 'success');
    } else {
        showToast('No translation to save!', 'warning');
    }
}



function showLoading(message = 'Processing...') {
    loadingOverlay.querySelector('p').textContent = message;
    loadingOverlay.classList.add('show');
}

function hideLoading() {
    loadingOverlay.classList.remove('show');
}

function showToast(message, type = 'info') {
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('i');
    
    // Set message and icon based on type
    toastMessage.textContent = message;
    
    switch (type) {
        case 'success':
            toastIcon.className = 'fas fa-check-circle';
            toast.style.borderLeftColor = 'var(--success-color)';
            break;
        case 'error':
            toastIcon.className = 'fas fa-exclamation-circle';
            toast.style.borderLeftColor = 'var(--error-color)';
            break;
        case 'warning':
            toastIcon.className = 'fas fa-exclamation-triangle';
            toast.style.borderLeftColor = 'var(--warning-color)';
            break;
        default:
            toastIcon.className = 'fas fa-info-circle';
            toast.style.borderLeftColor = 'var(--primary-color)';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to upload video
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (uploadSection.style.display !== 'none') {
            handleVideoUpload();
        }
    }
    
    // Escape to close upload interface
    if (e.key === 'Escape') {
        if (uploadSection.style.display !== 'none') {
            hideUploadInterface();
        }
    }
}

// Add CSS for translation text
const style = document.createElement('style');
style.textContent = `
    .translation-text {
        display: flex;
        align-items: center;
        gap: 1rem;
        text-align: left;
        width: 100%;
    }
    
    .translation-text i {
        font-size: 1.5rem;
        color: var(--primary-color);
        flex-shrink: 0;
    }
    
    .translation-text p {
        font-size: 1.125rem;
        color: var(--text-primary);
        font-weight: 500;
        margin: 0;
        line-height: 1.6;
    }
`;
document.head.appendChild(style);

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .video-upload-interface');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
});

// Example: Call PyScript translation from JS
function translateASLText(aslText) {
    // pyodide is available globally via PyScript
    pyodide.runPythonAsync(`translate_asl("${aslText}")`).then(result => {
        // Use result in UI
        updateTranslationResult(result);
    });
}
