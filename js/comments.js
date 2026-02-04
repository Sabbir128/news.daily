// Comments System - GitHub Pages Compatible

const CommentManager = {
    // Get all comments for an article
    getComments(articleId) {
        const allComments = this.getAllComments();
        return allComments.filter(c => c.articleId == articleId).sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
    },

    // Get all comments from localStorage
    getAllComments() {
        const comments = localStorage.getItem('articleComments');
        return comments ? JSON.parse(comments) : [];
    },

    // Save all comments
    saveAllComments(comments) {
        localStorage.setItem('articleComments', JSON.stringify(comments));
    },

    // Add new comment
    addComment(articleId, name, email, text) {
        const comment = {
            id: Date.now(),
            articleId: articleId,
            name: name,
            email: email,
            text: text,
            date: new Date().toISOString(),
            likes: 0,
            replies: []
        };

        const comments = this.getAllComments();
        comments.push(comment);
        this.saveAllComments(comments);

        // Add to user history
        UserManager.addUserComment(comment);

        return comment;
    },

    // Like a comment
    likeComment(commentId) {
        const comments = this.getAllComments();
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
            comment.likes = (comment.likes || 0) + 1;
            this.saveAllComments(comments);
            return true;
        }
        return false;
    },

    // Delete comment (only own comments)
    deleteComment(commentId) {
        let comments = this.getAllComments();
        comments = comments.filter(c => c.id !== commentId);
        this.saveAllComments(comments);
        return true;
    },

    // Get comment count for article
    getCommentCount(articleId) {
        return this.getComments(articleId).length;
    }
};
