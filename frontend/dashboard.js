// Dashboard logic

document.addEventListener('DOMContentLoaded', function() {
    renderDashboard();
});

function renderDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    
    try {
        let videos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
        
        // Filter out any invalid video entries
        videos = videos.filter(video => video && video.video && video.name);
        
        if (!videos.length) {
            dashboardContent.innerHTML = `
                <div class="dashboard-empty">
                    <i class="fas fa-video-slash"></i>
                    <p>Nothing is here yet</p>
                    <a href="record.html" class="btn btn-primary btn-large" id="createNewBtn">
                        <i class="fas fa-plus"></i> Create New
                    </a>
                </div>
            `;
            return;
        }
        
        let html = '<div class="dashboard-list">';
        videos.reverse().forEach((video, index) => {
            html += `
                <div class="dashboard-card" data-video-id="${video.id || index}">
                    <div class="dashboard-card-video">
                        <video src="${video.video}" controls preload="metadata" onerror="this.style.display='none'">
                            <source src="${video.video}" type="video/webm">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div class="dashboard-card-info">
                        <div class="dashboard-card-title">${video.name || 'Untitled Recording'}</div>
                        <div class="dashboard-card-date">${video.date || 'Unknown Date'}</div>
                        ${video.size ? `<div class="dashboard-card-size">${formatFileSize(video.size)}</div>` : ''}
                    </div>
                    <div class="dashboard-card-menu">
                        <button class="menu-btn" onclick="deleteVideo('${video.id || index}')" title="Delete video">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        html += `<div style="text-align:center;margin-top:2rem;"><a href="record.html" class="btn btn-primary btn-large"><i class="fas fa-plus"></i> Create New</a></div>`;
        dashboardContent.innerHTML = html;
        
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        dashboardContent.innerHTML = `
            <div class="dashboard-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading dashboard</p>
                <button onclick="renderDashboard()" class="btn btn-primary btn-large">
                    <i class="fas fa-refresh"></i> Retry
                </button>
            </div>
        `;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function deleteVideo(videoId) {
    if (confirm('Are you sure you want to delete this video?')) {
        try {
            let videos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
            videos = videos.filter(video => video.id !== videoId);
            localStorage.setItem('dashboardVideos', JSON.stringify(videos));
            renderDashboard();
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error deleting video. Please try again.');
        }
    }
}
