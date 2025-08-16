// Dashboard logic

document.addEventListener('DOMContentLoaded', function() {
    renderDashboard();
});

function renderDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    let videos = JSON.parse(localStorage.getItem('dashboardVideos') || '[]');
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
    videos.reverse().forEach(video => {
        html += `
            <div class="dashboard-card">
                <div class="dashboard-card-video">
                    <video src="${video.video}" controls preload="metadata"></video>
                </div>
                <div class="dashboard-card-info">
                    <div class="dashboard-card-title">${video.name}</div>
                    <div class="dashboard-card-date">${video.date}</div>
                </div>
                <div class="dashboard-card-menu">
                    <button class="menu-btn" title="More options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    html += `<div style="text-align:center;margin-top:2rem;"><a href="record.html" class="btn btn-primary btn-large"><i class="fas fa-plus"></i> Create New</a></div>`;
    dashboardContent.innerHTML = html;
}
