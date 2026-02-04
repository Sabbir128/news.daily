// Data Management Module
const DataManager = {
    // Get posts from localStorage
    getPosts() {
        const posts = localStorage.getItem('newsPosts');
        return posts ? JSON.parse(posts) : this.getDefaultPosts();
    },

    // Save posts to localStorage
    savePosts(posts) {
        localStorage.setItem('newsPosts', JSON.stringify(posts));
    },

    // Get settings
    getSettings() {
        const settings = localStorage.getItem('newsSettings');
        return settings ? JSON.parse(settings) : this.getDefaultSettings();
    },

    // Save settings
    saveSettings(settings) {
        localStorage.setItem('newsSettings', JSON.stringify(settings));
    },

    // Default posts for initial setup
    getDefaultPosts() {
        return [
            {
                id: 1,
                title: "Global Summit Reaches Historic Climate Agreement",
                category: "politics",
                image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800",
                excerpt: "World leaders have unanimously agreed on ambitious new targets to combat climate change by 2030.",
                content: "<p>In a landmark decision that has been hailed as 'turning point for humanity,' representatives from 195 countries have agreed to binding emissions targets that aim to limit global warming to 1.5 degrees Celsius.</p><p>The agreement, reached after two weeks of intense negotiations, includes unprecedented funding mechanisms for developing nations and strict monitoring protocols.</p><p>'This is not just a document; it is a promise to future generations,' said the UN Secretary-General during the closing ceremony.</p>",
                author: "Sarah Johnson",
                date: new Date().toISOString(),
                views: 1240
            },
            {
                id: 2,
                title: "Revolutionary AI Chip Promises 100x Speed Improvement",
                category: "technology",
                image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
                excerpt: "Tech giant unveils new quantum-inspired processor that could transform artificial intelligence applications.",
                content: "<p>The new 'NeuroCore' processor represents a fundamental shift in computing architecture, utilizing optical pathways instead of traditional electrical circuits.</p><p>Early benchmarks suggest the chip can train large language models in hours rather than weeks, potentially democratizing access to AI development.</p><p>Industry experts are calling this the most significant advancement since the invention of the transistor.</p>",
                author: "Michael Chen",
                date: new Date(Date.now() - 86400000).toISOString(),
                views: 892
            },
            {
                id: 3,
                title: "Underdog Team Wins Championship in Stunning Victory",
                category: "sports",
                image: "https://images.unsplash.com/photo-1461896836934- voices- 5e0d9f0f5b5b?w=800",
                excerpt: "In one of the greatest upsets in sports history, the seventh-seeded team claims the title.",
                content: "<p>What started as a seemingly ordinary season finale turned into a legendary performance that will be remembered for decades.</p><p>The team's star player, who had been battling injury throughout the playoffs, delivered a masterclass performance in the final quarter.</p><p>Fans stormed the court in celebration as the final buzzer sounded, marking the end of a 47-year championship drought.</p>",
                author: "David Rodriguez",
                date: new Date(Date.now() - 172800000).toISOString(),
                views: 2156
            }
        ];
    },

    // Default settings
    getDefaultSettings() {
        return {
            siteName: 'NewsDaily',
            tickerText: 'Breaking: Major developments in global markets today...',
            theme: 'light'
        };
    },

    // Initialize data if empty
    init() {
        if (!localStorage.getItem('newsPosts')) {
            this.savePosts(this.getDefaultPosts());
        }
        if (!localStorage.getItem('newsSettings')) {
            this.saveSettings(this.getDefaultSettings());
        }
    },

    // Add new post
    addPost(post) {
        const posts = this.getPosts();
        posts.unshift(post);
        this.savePosts(posts);
        return post;
    },

    // Update post
    updatePost(id, updatedPost) {
        const posts = this.getPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index !== -1) {
            posts[index] = { ...posts[index], ...updatedPost };
            this.savePosts(posts);
            return posts[index];
        }
        return null;
    },

    // Delete post
    deletePost(id) {
        const posts = this.getPosts();
        const filtered = posts.filter(p => p.id !== id);
        this.savePosts(filtered);
        return filtered.length < posts.length;
    },

    // Get single post
    getPost(id) {
        const posts = this.getPosts();
        return posts.find(p => p.id === id);
    },

    // Increment views
    incrementViews(id) {
        const posts = this.getPosts();
        const post = posts.find(p => p.id === id);
        if (post) {
            post.views = (post.views || 0) + 1;
            this.savePosts(posts);
        }
    },

    // Get posts by category
    getPostsByCategory(category) {
        const posts = this.getPosts();
        if (category === 'all') return posts;
        return posts.filter(p => p.category === category);
    },

    // Get stats
    getStats() {
        const posts = this.getPosts();
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        return {
            total: posts.length,
            views: posts.reduce((sum, p) => sum + (p.views || 0), 0),
            thisWeek: posts.filter(p => new Date(p.date).getTime() > oneWeekAgo).length,
            categories: [...new Set(posts.map(p => p.category))].length
        };
    },

    // Export all data
    exportData() {
        return {
            posts: this.getPosts(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    },

    // Import data
    importData(data) {
        if (data.posts) {
            this.savePosts(data.posts);
        }
        if (data.settings) {
            this.saveSettings(data.settings);
        }
        return true;
    }
};

// Initialize on load
DataManager.init();

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
    if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Theme management
function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
              }
              
