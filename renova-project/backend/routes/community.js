// ─── Community Routes ────────────────────────────────────────────────────────
// GET    /api/community/posts              — Get all posts (feed)
// POST   /api/community/posts              — Create a new post
// POST   /api/community/posts/:id/like     — Like/unlike a post
// GET    /api/community/posts/:id/comments — Get comments for a post
// POST   /api/community/posts/:id/comments — Add a comment
// DELETE /api/community/posts/:id          — Delete own post
// ────────────────────────────────────────────────────────────────────────────

const express = require("express");
const supabase = require("../config/supabase");
const { authenticate, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// ─── GET POSTS (FEED) ──────────────────────────────────────────────────────
router.get("/posts", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data: posts, error, count } = await supabase
      .from("posts")
      .select(`
        id, text, is_anonymous, tags, likes_count, created_at, updated_at,
        user_id
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    // Get user details for non-anonymous posts & comment counts
    const enrichedPosts = await Promise.all(
      (posts || []).map(async (post) => {
        // Get author info (only if not anonymous)
        let author = "Anonymous";
        let initials = "AN";
        if (!post.is_anonymous) {
          const { data: user } = await supabase
            .from("users")
            .select("name")
            .eq("id", post.user_id)
            .single();
          if (user) {
            author = user.name;
            initials = user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
          }
        }

        // Get comment count
        const { count: commentCount } = await supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("post_id", post.id);

        // Check if current user has liked this post
        const { data: userLike } = await supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", req.user.id)
          .single();

        return {
          id: post.id,
          author,
          initials,
          anon: post.is_anonymous,
          time: getTimeAgo(post.created_at),
          text: post.text,
          likes: post.likes_count || 0,
          liked: !!userLike,
          comments: commentCount || 0,
          tags: post.tags || [],
          isOwn: post.user_id === req.user.id,
        };
      })
    );

    res.json({
      posts: enrichedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

// ─── CREATE POST ────────────────────────────────────────────────────────────
router.post("/posts", authenticate, async (req, res) => {
  try {
    const { text, anonymous, tags } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Post text is required." });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: "Post must be under 2000 characters." });
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: req.user.id,
        text: text.trim(),
        is_anonymous: anonymous || false,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) throw error;

    // Return formatted post
    const { data: user } = await supabase.from("users").select("name").eq("id", req.user.id).single();

    res.status(201).json({
      message: "Post created.",
      post: {
        id: post.id,
        author: post.is_anonymous ? "Anonymous" : (user?.name || "User"),
        initials: post.is_anonymous ? "AN" : (user?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        anon: post.is_anonymous,
        time: "Just now",
        text: post.text,
        likes: 0,
        liked: false,
        comments: 0,
        tags: post.tags,
        isOwn: true,
      },
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: "Failed to create post." });
  }
});

// ─── LIKE / UNLIKE POST ─────────────────────────────────────────────────────
router.post("/posts/:id/like", authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if already liked
    const { data: existing } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      // Unlike — remove the like
      await supabase.from("post_likes").delete().eq("id", existing.id);
      await supabase.rpc("decrement_likes", { post_id_input: postId }).catch(() => {
        // Fallback: manual decrement
        return supabase.from("posts").select("likes_count").eq("id", postId).single()
          .then(({ data }) => supabase.from("posts").update({ likes_count: Math.max(0, (data?.likes_count || 1) - 1) }).eq("id", postId));
      });

      return res.json({ message: "Post unliked.", liked: false });
    }

    // Like — add the like
    await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
    await supabase.rpc("increment_likes", { post_id_input: postId }).catch(() => {
      // Fallback: manual increment
      return supabase.from("posts").select("likes_count").eq("id", postId).single()
        .then(({ data }) => supabase.from("posts").update({ likes_count: (data?.likes_count || 0) + 1 }).eq("id", postId));
    });

    res.json({ message: "Post liked.", liked: true });
  } catch (err) {
    console.error("Like post error:", err);
    res.status(500).json({ error: "Failed to like/unlike post." });
  }
});

// ─── GET COMMENTS ───────────────────────────────────────────────────────────
router.get("/posts/:id/comments", authenticate, async (req, res) => {
  try {
    const { data: comments, error } = await supabase
      .from("comments")
      .select("id, text, user_id, created_at")
      .eq("post_id", req.params.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Enrich with author info
    const enriched = await Promise.all(
      (comments || []).map(async (c) => {
        const { data: user } = await supabase
          .from("users")
          .select("name")
          .eq("id", c.user_id)
          .single();

        return {
          id: c.id,
          text: c.text,
          author: user?.name || "User",
          initials: (user?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
          time: getTimeAgo(c.created_at),
          isOwn: c.user_id === req.user.id,
        };
      })
    );

    res.json({ comments: enriched });
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
});

// ─── ADD COMMENT ────────────────────────────────────────────────────────────
router.post("/posts/:id/comments", authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: req.params.id,
        user_id: req.user.id,
        text: text.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    const { data: user } = await supabase.from("users").select("name").eq("id", req.user.id).single();

    res.status(201).json({
      message: "Comment added.",
      comment: {
        id: comment.id,
        text: comment.text,
        author: user?.name || "User",
        initials: (user?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        time: "Just now",
        isOwn: true,
      },
    });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Failed to add comment." });
  }
});

// ─── DELETE POST ────────────────────────────────────────────────────────────
router.delete("/posts/:id", authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) throw error;

    res.json({ message: "Post deleted." });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "Failed to delete post." });
  }
});

// ─── Helper: Time ago ───────────────────────────────────────────────────────
function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
}

module.exports = router;
