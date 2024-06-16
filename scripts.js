const API_KEY = "AIzaSyCB4cyXerd-FQ7FdaWFLZVG484nL8T65j8";
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search");
const videoList = document.getElementById("video-list");
const videoPlayer = document.getElementById("video-player");
const discriptionContainer = document.getElementById("description_container");
const menuButton = document.getElementById("menu_button");
const randomQuery = [
  "cricket",
  "k-pop",
  "Mern stack",
  "reactjs",
  "python",
  "apple mac book air",
  "machine learning",
];

fetchVideos(randomQuery[Math.floor(Math.random() * randomQuery.length)]);

searchBtn.addEventListener("click", () => {
  const query = searchInput.value;
  fetchVideos(query);
});

menuButton.addEventListener("click", () => {
  let c1classes = document.getElementById("column_1").classList;
  if (c1classes.contains("hidden")) {
    c1classes.remove("hidden");
  } else {
    c1classes.add("hidden");
  }
});

function fetchVideos(query) {
  fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=10&type=video&key=${API_KEY}`
  )
    .then((response) => response.json())
    .then((data) => {
      videoList.innerHTML = "";
      data.items.forEach((item, index) => {
        const videoId = item.id.videoId;
        const thumbnail = item.snippet.thumbnails.default.url;
        const title = item.snippet.title;
        const videoElement = document.createElement("div");
        videoElement.classList.add("video-item");
        videoElement.innerHTML = `
                    <img src="${thumbnail}" alt="Video Thumbnail">
                    <div class="title_channel_description">
                      <p class="video-title truncate">${title}</p>
                      <p class="video-channel-name truncate">• ${item.snippet?.channelTitle}</p>
                      <p class="video-description truncate">${item.snippet?.description}</p>
                    </div>
                    <button class="top-right-absolute"><i class="fa fa-ellipsis-v"></i></button>
                `;
        videoElement.addEventListener("click", () => {
          playVideo(videoId);
          createDiscription(item);
        });
        videoList.appendChild(videoElement);
      });
      if (!videoPlayer.innerHTML.trim()) {
        playVideo(data.items[0].id.videoId);
      }
    })
    .catch((error) => console.error("Error fetching videos:", error));
}
function fetchComments(videoId) {
  fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("comments data", data);
      const commentsContainer = document.getElementById("comments_container");
      commentsContainer.innerHTML = null;
      commentsContainer.classList.add("comments");
      const commentCount = document.createElement("div");
      commentCount.innerHTML = `<h3>${data.items.length} Comments</h3>`;
      commentsContainer.append(commentCount);
      data.items.forEach((item) => {
        const comment = item.snippet.topLevelComment.snippet.textDisplay;
        const author = item.snippet.topLevelComment.snippet.authorDisplayName;
        const imageUrl =
          item.snippet.topLevelComment.snippet.authorProfileImageUrl;
        const likesCount = item.snippet.topLevelComment.snippet.likeCount;
        const date = new Date(item.snippet.topLevelComment.snippet.publishedAt);
        const commentElement = document.createElement("div");
        commentElement.classList.add("comment");
        commentElement.innerHTML = `
                    <div class="comment_details">
                      <img src="${imageUrl}" alt="${author}" style="width:40px; height:40px; border-radius:50%;">
                      <div>
                          <p><strong>${author}</strong>: ${timeSince(date)}</p>
                          <p class="truncate" style="-webkit-line-clamp: 2;">${comment}</p>
                          <span>
                            <span><i class="fa fa-thumbs-o-up"></i> ${likesCount}</span>
                            <span><i class="fa fa-thumbs-o-down"></i> ${likesCount}</span>
                            <span> Reply</span>
                          </span>
                      </div>  
                    </div>
                                    `;
        commentsContainer.appendChild(commentElement);
      });
      // document.body.appendChild(commentsContainer);
    })
    .catch((error) => console.error("Error fetching comments:", error));
}

function playVideo(videoId) {
  videoPlayer.innerHTML = `
        <iframe width="100%" height="400px" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
    `;
  fetchVideoDetails(videoId);
  fetchComments(videoId);
}

///////////////////////
async function fetchVideoDetails(videoId) {
  // Fetch video details
  const videoResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`
  );
  const videoData = await videoResponse.json();

  if (videoData.items.length === 0) {
    document.getElementById("description_container").innerText =
      "Video not found.";
    return;
  }

  const video = videoData.items[0];

  // Fetch channel details
  const channelId = video.snippet.channelId;
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`
  );
  const channelData = await channelResponse.json();
  const channel = channelData.items[0];
  console.log("channel:", channel);
  console.log("video data:", video);

  // Extract data
  const title = video.snippet.title;
  const description = video.snippet.description;
  console.log("desc:", description);
  const publishedAt = new Date(video.snippet.publishedAt);
  const views = video.statistics.viewCount;
  const likes = video.statistics.likeCount;
  const channelName = video.snippet.channelTitle;
  const channelAvatar = channel.snippet.thumbnails.default.url;

  // Calculate time ago
  const timeAgo = timeSince(publishedAt);

  // Create description HTML
  const descriptionHTML = `
      <h3>${title}</h3>
      <div class="channel_stats">
      <div style="display: flex;
                  gap: 10px;
                  align-items: center;">
      <img src="${channelAvatar}" alt="${channelName}" style="width:40px; height:40px; border-radius:50%;">
      <div><span><strong>${channelName}</strong></span><p style="font-size: 12px;">318k</p></div>
      </div>
          <button >Join</button>
          <button >Subscribe</button>
          <div class="like_dislike">
            <span class="like"><i class="fa fa-thumbs-o-up"></i> 234K</span>
            <span class="dislike"><i class="fa fa-thumbs-o-down"></i></span>
          </div>
          <button>Share <i class="fa fa-share"></i></button>
          <button><i class="fa fa-ellipsis-h"></i></button>
      </div>
      <div class="video_stats">
      <p><strong>Views:</strong> ${views} | <strong>Likes:</strong> ${likes} | <strong>Published:</strong> ${timeAgo}</p>
      <br>
      <p class="truncate" style="-webkit-line-clamp: 3;">${description}</p>
      </div>
  `;
  // Insert description into the container
  document.getElementById("description_container").innerHTML = descriptionHTML;
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) return `${interval} years ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  return `${Math.floor(seconds)} seconds ago`;
}
