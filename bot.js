const Twit = require('twit');

const client = new Twit({
  consumer_key: 'Ek20wjJsWbQX0tRpHVcLnugJD',
  consumer_secret: 'shWZakD2PXrlWSuLv3jrzU5Iq3FokxD8PoiqWcONxGxa9pXjuQ',
  access_token: '596575112-7A2AyGiUeJcqFDbJJMhYcC1jz8UPqS5Gxvn4ctWL',
  access_token_secret: 'iUvbaKqvbf56lFBxPRfLLyvelGGeLSY9OIQHG4NOKXcY3',
});

// Search for tweets mentioning your bot
client.get('search/tweets', { q: '@SprintBot_Test', count: 10 }, (err, data, response) => {
    if (err) {
      console.error('Error retrieving tweets:', err);
      return;
    }
  
    const tweets = data.statuses;
    for (const tweet of tweets) {
      const tweetId = tweet.id_str;
      const screenName = tweet.user.screen_name;
  
      // Process the video (e.g., create or modify video)
  
      // Upload the processed video
      client.postMediaChunked({ file_path: 'path/to/processed_video.mp4' }, (err, data, response) => {
        if (err) {
          console.error('Error uploading video:', err);
          return;
        }
  
        const mediaId = data.media_id_string;
  
        // Reply to the tweet with the processed video
        client.post('statuses/update', {
          status: `@${screenName} Here's your video!`,
          in_reply_to_status_id: tweetId,
          media_ids: [mediaId],
        }, (err, data, response) => {
          if (err) {
            console.error('Error replying to tweet:', err);
            return;
          }
  
          console.log('Tweet replied with video successfully!');
        });
      });
    }
  });
  