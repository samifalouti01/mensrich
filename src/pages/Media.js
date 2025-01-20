import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { FaHeart, FaRegComment, FaPaperPlane } from 'react-icons/fa';
import { IoBookmarkOutline } from "react-icons/io5";
import "./Media.css";

const Media = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState({});
  const [userLikes, setUserLikes] = useState({});
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentPopup, setCommentPopup] = useState({});
  
  useEffect(() => {
    getCurrentUser();
  }, []);
  
  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);
  
  useEffect(() => {
    if (posts.length > 0) {
      posts.forEach(post => {
        fetchComments(post.id);
        fetchLikes(post.id);
      });
    }
  }, [posts]);

  const getCurrentUser = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      try {
        const { data, error } = await supabase
          .from("user_data")
          .select("id, email, phone, user_image")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        setUserId(data.id);
      } catch (error) {
        console.error('Error fetching user:', error.message);
      }
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`*`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch (error) {
      console.error('Error fetching comments:', error.message);
    }
  };

  const fetchLikes = async (postId) => {
    try {
      const { data: likesData, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId);

      if (error) throw error;
      setLikes(prev => ({ ...prev, [postId]: likesData.length }));
      const userLike = likesData.find(like => like.user_id === userId);
      setUserLikes(prev => ({ ...prev, [postId]: !!userLike }));
    } catch (error) {
      console.error('Error fetching likes:', error.message);
    }
  };

  const handleLike = async (postId) => {
    try {
      if (userLikes[postId]) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: userId }]);

        if (error) throw error;
      }
      fetchLikes(postId);
    } catch (error) {
      console.error('Error handling like:', error.message);
    }
  };

  const handleComment = async (postId) => {
    try {
      if (!newComment.trim()) return;

      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: userId,
          text: newComment.trim()
        }]);

      if (error) throw error;

      setNewComment("");
      fetchComments(postId);
    } catch (error) {
      console.error('Error posting comment:', error.message);
    }
  };

  const toggleCommentPopup = (postId) => {
    setCommentPopup((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="media-container">
      <div className="posts-wrapper">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <img className="user-avatar" src={post.user_image || "/default-avatar.svg"} alt="User Avatar" />
              <div className="user-info">
                <span className="user-email">{post.email || "Unknown User"}</span>
              </div>
            </div>
            <img className="user-avatar" src={post.user_data?.user_image || "/Mensrich.svg"} alt="User Avatar" />
                <div className="user-info">
                    <span className="user-email">{post.user_data?.email || "Unknown User"}</span>
                    <span className="post-location">{post.location || "Unknown Location"}</span>
                </div>
                {post.image_url && <img className="post-image" src={post.image_url} loading="lazy" alt="Post content" />}
            <div className="post-actions">
              <button onClick={() => handleLike(post.id)}><FaHeart className={userLikes[post.id] ? "liked" : "unliked"} /></button>
              <button onClick={() => toggleCommentPopup(post.id)}><FaRegComment /></button>
            </div>
            <div className="like-count">{likes[post.id] || 0} likes</div>
            <div className="post-caption">
              <span className="user-email">{post.email || "Unknown User"}</span> {post.text}
            </div>
            
            {commentPopup[post.id] && (
              <div className={`comment-popup ${commentPopup[post.id] ? "show" : ""}`}>
                <div className="comments-section">
                  {comments[post.id] && comments[post.id].map((comment) => (
                    <div key={comment.id} className="comment">
                      <span className="comment-user">{comment.user_data?.email || "Unknown User"}</span>
                      <span className="comment-text">{comment.text}</span>
                      <span className="comment-date">{formatDate(comment.created_at)}</span>
                    </div>
                  ))}
                </div>
                <div className="comment-input">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                  />
                  <button onClick={() => handleComment(post.id)}>Post</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Media;
