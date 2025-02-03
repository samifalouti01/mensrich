import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import "./Media.css";

const Media = () => {
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [userLikes, setUserLikes] = useState({});
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRefs = useRef({}); // Ref to store video elements

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

  const fetchLikes = async (postId) => {
    try {
      const { data: likesData, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId);
  
      if (error) throw error;
      console.log(`Likes for post ${postId}:`, likesData.length); // Add this log to check the fetched likes count
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

  const isVideo = (url) => {
    const videoExtensions = [".mp4", ".webm", ".ogg"];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const handleVideoClick = (postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || "download"; // Default filename if not provided
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatLikes = (count) => {
    console.log(`Formatting likes count: ${count}`); // Add this log to see the number being passed
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return Math.floor(count / 1000) + "K"; // Ensure proper rounding for values >= 1000
    } else {
      return count;
    }
  };
  

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className="media-container">
        <div className="posts-wrapper">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <img className="user-avatar" src={post.user_image || "/Mensrich.svg"} alt="User Avatar" />
                <div className="user-info">
                  <span className="user-email">{post.email || "Men's Rich"}</span>
                </div>
              </div>
              {post.image_url && (
                isVideo(post.image_url) ? (
                  <div className="video-wrapper" onClick={() => handleVideoClick(post.id)}>
                    <video
                      ref={(el) => (videoRefs.current[post.id] = el)}
                      className="post-media"
                      loop
                      muted
                      playsInline
                    >
                      <source src={post.image_url} type={`video/${post.image_url.split('.').pop()}`} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <img className="post-media" src={post.image_url} loading="lazy" alt="Post content" />
                )
              )}
              <div className="post-actions">
                <button onClick={() => handleLike(post.id)}>
                  {userLikes[post.id] ? (
                    <i class="bi bi-heart-fill" style={{ color: "#ef4444"}}></i>
                  ) : (
                    <i class="bi bi-heart" style={{ color: "#4b5563"}}></i>
                  )}
                </button>
                <button onClick={() => handleDownload(post.image_url, `post_${post.id}`)}>
                  <i class="bi bi-download"></i>
                </button>
              </div>
              <div className="like-count">{formatLikes(likes[post.id] || 0)} likes</div>
              <div className="post-caption">
                <span className="user-email">{post.email || "Men's Rich"}</span> {post.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Media;
