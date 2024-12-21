import React, { useState } from "react";
import { supabase } from "../../../supabaseClient";
import "./Post.css";

const Post = () => {
  const [title, setTitle] = useState("");
  const [ref, setRef] = useState("");
  const [price, setPrice] = useState("");
  const [sex, setSex] = useState("hommes");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image to upload.");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    setIsLoading(true);

    try {
      // Upload image to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("store_rec")
        .upload(fileName, file);

        if (uploadData) {
        console.log("Upload successful:", uploadData);
        }


      if (uploadError) {
        setMessage(`Error uploading image: ${uploadError.message}`);
        setIsLoading(false);
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("store_rec")
        .getPublicUrl(fileName);

      if (!publicUrlData.publicUrl) {
        setMessage("Could not retrieve public URL for the image.");
        setIsLoading(false);
        return;
      }

      const publicUrl = publicUrlData.publicUrl;

      // Insert data into the database
      const payload = {
        title,
        ref,
        price,
        sex,
        product_image: publicUrl,
      };

      const { error: insertError } = await supabase
        .from("store")
        .insert([payload]);

      if (insertError) {
        setMessage(`Error inserting data: ${insertError.message}`);
      } else {
        setMessage("Post added successfully!");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="post-container">
      <h1>Create New Post</h1>
      <input
      className="parrain-input"
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
      className="parrain-input"
        type="text"
        placeholder="Reference"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
      />
      <input
      className="parrain-input"
        type="text"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <select
        value={sex}
        onChange={(e) => setSex(e.target.value)}
      >
        <option value="hommes">Hommes</option>
        <option value="femmes">Femmes</option>
      </select>
      <input
      className="parrain-input"
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        className="button-primary"
        onClick={handleUpload}
        disabled={isLoading}
      >
        {isLoading ? <span className="spinner"></span> : "Upload"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Post;
