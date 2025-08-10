// DOM Elements
const startBtn = document.getElementById('startBtn');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

const translationSection = document.getElementById('translationSection');
const closeBtn = document.getElementById('closeBtn');
const enableCameraBtn = document.getElementById('enableCameraBtn');
const translateBtn = document.getElementById('translateBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const saveBtn = document.getElementById('saveBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const toast = document.getElementById('toast');
const translationResult = document.getElementById('translationResult');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');
const videoFeed = document.getElementById('videoFeed');
const canvas = document.getElementById('canvas');

// State Management
let isTranslating = false;
let isPaused = false;
let stream = null;
let animationFrame = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
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

function initializeEventListeners() {
    // Start translation button
    startBtn.addEventListener('click', () => {
        showTranslationInterface();
        showToast('Translation interface opened!', 'success');
    });

    // Login button
    loginBtn.addEventListener('click', () => {
        showToast('Login functionality coming soon!', 'info');
    });

    // Signup button
    signupBtn.addEventListener('click', () => {
        showToast('Sign up functionality coming soon!', 'info');
    });



    // Close translation interface
    closeBtn.addEventListener('click', () => {
        hideTranslationInterface();
        stopCamera();
    });

    // Enable camera button
    enableCameraBtn.addEventListener('click', () => {
        enableCamera();
    });

    // Translate button
    translateBtn.addEventListener('click', () => {
        toggleTranslation();
    });

    // Pause button
    pauseBtn.addEventListener('click', () => {
        togglePause();
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        resetTranslation();
    });

    // Copy button
    copyBtn.addEventListener('click', () => {
        copyTranslation();
    });

    // Share button
    shareBtn.addEventListener('click', () => {
        shareTranslation();
    });

    // Save button
    saveBtn.addEventListener('click', () => {
        saveTranslation();
    });

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

function showTranslationInterface() {
    translationSection.style.display = 'block';
    translationSection.scrollIntoView({ behavior: 'smooth' });
    
    // Add entrance animation
    translationSection.style.opacity = '0';
    translationSection.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        translationSection.style.transition = 'all 0.6s ease';
        translationSection.style.opacity = '1';
        translationSection.style.transform = 'translateY(0)';
    }, 100);
}

function hideTranslationInterface() {
    translationSection.style.transition = 'all 0.4s ease';
    translationSection.style.opacity = '0';
    translationSection.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        translationSection.style.display = 'none';
        translationSection.style.opacity = '1';
        translationSection.style.transform = 'translateY(0)';
    }, 400);
}

async function enableCamera() {
    try {
        showLoading('Accessing camera...');
        
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            } 
        });
        
        videoFeed.srcObject = stream;
        videoFeed.style.display = 'block';
        cameraPlaceholder.style.display = 'none';
        
        hideLoading();
        showToast('Camera enabled successfully!', 'success');
        
        // Initialize canvas for frame capture
        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
        
    } catch (error) {
        hideLoading();
        showToast('Failed to access camera. Please check permissions.', 'error');
        console.error('Camera access error:', error);
    }
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
                title: 'ASL Translation',
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
        a.download = 'asl-translation.txt';
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
    // Ctrl/Cmd + Enter to start translation
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (translationSection.style.display !== 'none') {
            toggleTranslation();
        }
    }
    
    // Escape to close translation interface
    if (e.key === 'Escape') {
        if (translationSection.style.display !== 'none') {
            hideTranslationInterface();
        }
    }
    
    // Space to pause/resume
    if (e.key === ' ' && translationSection.style.display !== 'none') {
        e.preventDefault();
        togglePause();
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
    const animatedElements = document.querySelectorAll('.feature-card, .translation-interface');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
});
