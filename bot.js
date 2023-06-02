const Twit = require('twit');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const axios = require('axios');

// Set up Twitter API credentials
const twitterClient = new Twit({
  consumer_key: 'ZEyCqSQoXfMPxdz9UGRnSX3gT',
  consumer_secret: 'NKWJsA1zdDBqCiHWE34XF4l13WonR63MbBIuy6imPEP83xVOUG',
  access_token: '1664679037908680720-e2s8Vu2r5zMcNuGNWKSWdsuHbnKY5y',
  access_token_secret: 'Pi6qXm8KaQDZnVtc9uFY1tE1oUqI6EuJNgjTnTsQMVv3v',
});

// Set up Cloudinary credentials
cloudinary.config({
  cloud_name: 'sprintcorp',
  api_key: '771228328885469',
  api_secret: 'YOUR_CLOUDINARY_API_SECRET',
});

// Create a Twitter stream
const stream = twitterClient.stream('statuses/filter', { track: '@@GrabVideos' });

// Listen for tweet events
stream.on('tweet', tweet => {
  // Check if the tweet is a mention
  if (tweet.in_reply_to_screen_name === 'GrabVideos') {
    handleMentions(tweet);
  }
});

// Error handling for stream
stream.on('error', error => {
  console.error('Stream error:', error);
  if (error.statusCode === 404) {
    console.log('Invalid Twitter streaming request: 404');
  }
});

// Function to handle mentions
function handleMentions(tweet) {
  // Extract video URL from tweet
  // const videoUrl = extractVideoUrl(tweet.text);
  const videoUrl = extractVideoUrl('https://twitter.com/DAMIADENUGA/status/1664635054507565059?s=20');

  // Process the video
  processVideo(videoUrl)
    .then(cloudinaryUrl => {
      console.log('Video processed:', cloudinaryUrl);
      // You can perform further actions with the processed video URL
    })
    .catch(error => {
      console.error('Video processing error:', error);
    });
}

// Function to extract video URL from tweet
function extractVideoUrl(text) {
  const videoUrlPattern = /(?:https?:\/\/)?(?:www\.)?twitter\.com\/\w+\/status\/\d+\/video\/\d+/;
  const match = text.match(videoUrlPattern);
  if (match) {
    return match[0];
  } else {
    throw new Error('Video URL not found in tweet');
  }
}


// Function to process the video
function processVideo(videoUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      // Download the video
      const localPath = await downloadVideo(videoUrl);

      // Upload the video to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(localPath);

      resolve(cloudinaryUrl);
    } catch (error) {
      reject(error);
    }
  });
}

// Function to download the video
function downloadVideo(videoUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate a unique filename for the video
      const filename = `${Date.now()}.mp4`;

      // Download the video file using axios
      const response = await axios.get(videoUrl, { responseType: 'stream' });

      // Create a write stream to save the video file
      const writeStream = fs.createWriteStream(filename);

      // Pipe the response stream into the write stream
      response.data.pipe(writeStream);

      // Handle the completion of writing the video file
      writeStream.on('finish', () => {
        resolve(filename);
      });

      // Handle any errors during writing the video file
      writeStream.on('error', error => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Function to upload the video to Cloudinary
function uploadToCloudinary(localPath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(localPath, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.secure_url);
      }
    });
  });
}

// Start the application
console.log('Bot is running...');
