import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const Creative = () => {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatives = async () => {
      try {
        const { data, error } = await supabase.from("creative").select("*");
        if (error) throw error;
        setCreatives(data);
      } catch (error) {
        console.error("Error fetching creatives:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatives();
  }, []);

  const getSignedDownloadUrl = async (path) => {
    const { data, error } = await supabase
      .storage
      .from("creative")
      .createSignedUrl(path, 60); // Valid for 60 seconds
    if (error) throw error;
    return data.signedUrl;
  };

  const handleDownload = async (link) => {
    try {
      // Remove query parameters from the link for file name extraction
      const baseLink = link.split("?")[0];
      const fileType = baseLink.split(".").pop(); // Get file extension
      const filename = baseLink.split("/").pop(); // Extract file name

      // For private files, get a signed URL
      const { data: signedUrl, error } = await supabase.storage
        .from("creative")
        .createSignedUrl(link.replace(/^.*\/storage\/v1\/object\/public\/creative\//, ""), 60);

      if (error) {
        console.error("Error generating signed URL:", error.message);
        return;
      }

      const downloadUrl = signedUrl?.signedUrl || link; // Use signed URL if private, else use public link

      // Create an anchor element for downloading
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = filename || `file.${fileType}`; // Fallback file name
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch (error) {
      console.error("Error downloading file:", error.message);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Header />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Creative Gallery
        </Typography>
        <Grid container spacing={4}>
          {creatives.map((creative) => (
            <Grid item xs={12} sm={6} md={4} key={creative.id}>
              <Card>
                {creative.link.split("?")[0].endsWith(".mp4") ? ( // Check for video type
                  <>
                    <CardMedia
                      component="video"
                      controls
                      sx={{ height: 200 }}
                    >
                      <source src={creative.link} type="video/mp4" />
                      Your browser does not support the video tag.
                    </CardMedia>
                  </>
                ) : (
                  <CardMedia
                    component="img"
                    image={creative.link}
                    alt={`Creative ${creative.id}`}
                    sx={{ height: 200 }}
                  />
                )}
                <CardContent>
                  <Typography variant="body1">
                    Creative ID: {creative.id}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(creative.link)}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </div>
  );
};

export default Creative;
