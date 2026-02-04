// Admin Panel Functionality

// Check authentication on load
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    loadTheme();
    updateDashboard();
    showSection('dashboard');
    
    // Setup event listeners
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Post form
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', savePost);
    }
    
    // Image preview
    const postImage = document.getElementById('postImage');
    if (postImage) {
        postForm.addEventListener('input', previewImage);
    }
}

// Authentication check
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    const loginTime = sessionStorage.getItem('loginTime');
    
    // Session expires after 2 hours
    const SESSION_DURATION = 2 * 60 * 60 * 1000;
    
    if (!isAuthenticated || !loginTime || (Date.now() - parseInt(loginTime)) > SESSION_DURATION) {
        logout();
        return false;
    }
    return true;
}

// Logout
function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('loginTime');
    window.location.href = 'login.html';
}

// Show section
function showSection(section) {
    // Update nav
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(section)) {
            link.classList.add('active');
        }
    });

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // Show selected
    const selected = document.getElementById(section + '-section');
    if (selected) {
        selected.classList.add('active');
    }

    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'new-post': 'Create New Post',
        'posts': 'All Posts',
        'settings': 'Settings'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[section] || 'Admin Panel';
    }

    // Refresh data if needed
    if (section === 'dashboard') updateDashboard();
    if (section === 'posts') renderAllPosts();
}

// Update dashboard stats
function updateDashboard() {
    const stats = DataManager.getStats();
    
    const totalPosts = document.getElementById('totalPosts');
    const totalViews = document.getElementById('totalViews');
    const thisWeek = document.getElementById('thisWeek');
    const categories = document.getElementById('categories');
    
    if (totalPosts) totalPosts.textContent = stats.total;
    if (totalViews) totalViews.textContent = stats.views.toLocaleString();
    if (thisWeek) thisWeek.textContent = stats.thisWeek;
    if (categories) categories.textContent = stats.categories;

    // Recent posts table
    const posts = DataManager.getPosts().slice(0, 5);
    const tbody = document.getElementById('recentPostsTable');
    
    if (tbody) {
        if (posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No posts yet</td></tr>';
        } else {
            tbody.innerHTML = posts.map(post => `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${post.image}" class="post-thumb" onerror="this.src='https://via.placeholder.com/60x40'" style="width: 60px; height: 40px; object-fit: cover; border-radius: 5px;">
                            <span style="font-weight: 600;">${post.title.substring(0, 40)}${post.title.length > 40 ? '...' : ''}</span>
                        </div>
                    </td>
                    <td><span class="category-tag" style="font-size: 0.75rem; padding: 3px 10px;">${post.category}</span></td>
                    <td>${formatDate(post.date)}</td>
                    <td>${post.views || 0}</td>
                    <td>
                        <div class="action-btns" style="display: flex; gap: 8px;">
                            <button class="btn-icon btn-edit" onclick="editPost(${post.id})" title="Edit" style="background: var(--secondary); color: white; border: none; width: 35px; height: 35px; border-radius: 8px; cursor: pointer;">✏️</button>
                            <button class="btn-icon btn-delete" onclick="deletePost(${post.id})" title="Delete" style="background: #dc3545; color: white; border: none; width: 35px; height: 35px; border-radius: 8px; cursor: pointer;">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Render all posts
function renderAllPosts() {
    const posts = DataManager.getPosts();
    const tbody = document.getElementById('allPostsTable');
    
    if (tbody) {
        if (posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No posts found</td></tr>';
        } else {
            tbody.innerHTML = posts.map(post => `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${post.image}" class="post-thumb" onerror="this.src='https://via.placeholder.com/60x40'" style="width: 60px; height: 40px; object-fit: cover; border-radius: 5px;">
                            <div>
                                <div style="font-weight: 600;">${post.title.substring(0, 50)}${post.title.length > 50 ? '...' : ''}</div>
                                <small style="color: var(--gray);">${post.excerpt ? post.excerpt.substring(0, 60) : ''}${post.excerpt && post.excerpt.length > 60 ? '...' : ''}</small>
                            </div>
                        </div>
                    </td>
                    <td><span class="category-tag" style="font-size: 0.75rem; padding: 3px 10px;">${post.category}</span></td>
                    <td>${post.author}</td>
                    <td>${formatDate(post.date)}</td>
                    <td>${post.views || 0}</td>
                    <td>
                        <div class="action-btns" style="display: flex; gap: 8px;">
                            <button class="btn-icon btn-edit" onclick="editPost(${post.id})" title="Edit" style="background: var(--secondary); color: white; border: none; width: 35px; height: 35px; border-radius: 8px; cursor: pointer;">✏️</button>
                            <button class="btn-icon btn-delete" onclick="deletePost(${post.id})" title="Delete" style="background: #dc3545; color: white; border: none; width: 35px; height: 35px; border-radius: 8px; cursor: pointer;">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Preview image
function previewImage() {
    const url = document.getElementById('postImage').value;
    const preview = document.getElementById('imagePreview');
    
    if (preview) {
        if (url) {
            preview.src = url;
            preview.style.display = 'block';
            preview.onerror = function() {
                this.style.display = 'none';
                showToast('Invalid image URL', 'error');
            };
        } else {
            preview.style.display = 'none';
        }
    }
}

// Save post
function savePost(e) {
    e.preventDefault();
    
    if (!checkAuth()) return false;

    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const image = document.getElementById('postImage').value;
    const excerpt = document.getElementById('postExcerpt').value;
    const content = document.getElementById('postContent').value;
    const author = document.getElementById('postAuthor').value;

    if (!title || !category || !image || !excerpt || !content || !author) {
        showToast('Please fill all required fields', 'error');
        return false;
    }

    const post = {
        id: Date.now(),
        title: title,
        category: category,
        image: image,
        excerpt: excerpt,
        content: '<p>' + content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>',
        author: author,
        date: new Date().toISOString(),
        views: 0
    };

    // Check if editing
    const editingId = document.getElementById('postForm').getAttribute('data-editing');
    if (editingId) {
        DataManager.updatePost(parseInt(editingId), post);
        showToast('Post updated successfully!', 'success');
        document.getElementById('postForm').removeAttribute('data-editing');
    } else {
        DataManager.addPost(post);
        showToast('Post published successfully!', 'success');
    }
    
    // Reset form
    document.getElementById('postForm').reset();
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
    }
    
    // Refresh dashboard
    updateDashboard();
    
    return false;
}

// Reset form
function resetForm() {
    const form = document.getElementById('postForm');
    if (form) {
        form.reset();
        form.removeAttribute('data-editing');
    }
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
    }
}

// Edit post
function editPost(id) {
    const post = DataManager.getPost(id);
    if (!post) {
        showToast('Post not found', 'error');
        return;
    }

    // Fill form
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postCategory').value = post.category;
    document.getElementById('postImage').value = post.image;
    document.getElementById('postExcerpt').value = post.excerpt;
    document.getElementById('postContent').value = post.content.replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<br>/g, '\n');
    document.getElementById('postAuthor').value = post.author;
    
    // Show image preview
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.src = post.image;
        imagePreview.style.display = 'block';
    }
    
    // Mark as editing
    document.getElementById('postForm').setAttribute('data-editing', id);
    
    // Switch to new post tab
    showSection('new-post');
    
    showToast('Editing post: ' + post.title, 'success');
}

// Delete post
function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }
    
    if (DataManager.deletePost(id)) {
        showToast('Post deleted successfully', 'success');
        updateDashboard();
        renderAllPosts();
    } else {
        showToast('Failed to delete post', 'error');
    }
}

// Change password
async function changePassword(e) {
    e.preventDefault();
    
    const currentPass = document.getElementById('currentPass').value;
    const newPass = document.getElementById('newPass').value;
    const confirmPass = document.getElementById('confirmPass').value;
    
    if (newPass !== confirmPass) {
        showToast('New passwords do not match', 'error');
        return false;
    }
    
    if (newPass.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return false;
    }
    
    // Hash current password
    const hashedCurrent = await hashPassword(currentPass);
    const storedHash = localStorage.getItem('adminPasswordHash') || '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
    
    if (hashedCurrent !== storedHash) {
        showToast('Current password is incorrect', 'error');
        return false;
    }
    
    // Hash and save new password
    const hashedNew = await hashPassword(newPass);
    localStorage.setItem('adminPasswordHash', hashedNew);
    
    showToast('Password changed successfully!', 'success');
    
    // Clear form
    document.getElementById('currentPass').value = '';
    document.getElementById('newPass').value = '';
    document.getElementById('confirmPass').value = '';
    
    return false;
}

// Hash password
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Export data
function exportData() {
    const data = DataManager.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsdaily-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully', 'success');
}

// Import data
function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.posts || !Array.isArray(data.posts)) {
                throw new Error('Invalid data format');
            }
            
            if (confirm(`This will replace all ${DataManager.getPosts().length} existing posts with ${data.posts.length} imported posts. Continue?`)) {
                DataManager.importData(data);
                updateDashboard();
                renderAllPosts();
                showToast('Data imported successfully!', 'success');
            }
        } catch (err) {
            showToast('Error importing data: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset input
    input.value = '';
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } else {
        alert(message);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any modals or go back
    }
});
    const tbody = document.getElementById('allPostsTable');
    
    if (tbody) {
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${post.image}" class="post-thumb" onerror="this.src='https://via.placeholder.com/60x40'">
                        <div>
                            <div style="font-weight: 600;">${post.title.substring(0, 50)}...</div>
                            <small style="color: var(--gray);">${post.excerpt.substring(0, 60)}...</small>
                        </div>
                    </div>
                </td>
                <td><span class="category-tag" style="font-size: 0.75rem;">${post.category}</span></td>
                <td>${post.author}</td>
                <td>${formatDate(post.date)}</td>
                <td>${post.views || 0}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-edit" onclick="editPost(${post.id})" title="Edit">✏️</button>
                        <button class="btn-icon btn-delete" onclick="deletePost(${post.id})" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Preview image
function previewImage() {
    const url = document.getElementById('postImage').value;
    const preview = document.getElementById('imagePreview');
    
    if (url && preview) {
        preview.src = url;
        preview.style.display = 'block';
        preview.onerror = function() {
            this.style.display = 'none';
            showToast('Invalid image URL', 'error');
        };
    }
}

// Save post
function savePost(e) {
    e.preventDefault();
    
    if (!checkAuth()) return false;

    const post = {
        id: Date.now(),
        title: document.getElementById('postTitle').value,
        category: document.getElementById('postCategory').value,
        image: document.getElementById('postImage').value,
        excerpt: document.getElementById('postExcerpt').value,
        content: document.getElementById('postContent').value.replace(/\n/g, '</p><p>'),
        author: document.getElementById('postAuthor').value,
        date: new Date().toISOString(),
        views: 0
    };

    DataManager.addPost(post);
    showToast('Post published successfully!', 'success');
    
    // Reset form
    document.getElementById('postForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
    
    return false;
}

// Reset form
function resetForm() {
    document.getElementById('postForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
}

// Edit post
function editPost(id) {

                              
