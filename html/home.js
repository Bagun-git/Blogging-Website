document.addEventListener("DOMContentLoaded", () => {
  console.log("home.js loaded and DOM ready!");

  document.getElementById('searchInput').addEventListener('input', async function() {
  const query = this.value.trim();
  const resultsContainer = document.getElementById('searchResults');

  if (!query) {
    resultsContainer.innerHTML = '';
    return;
  }

  const res = await fetch(`/search-users?q=${encodeURIComponent(query)}`);
  const users = await res.json();

  resultsContainer.innerHTML = users.map(user => 
    `<div data-id="${user._id}">@${user.fullname}</div>`
  ).join('');

  // Handle click
  Array.from(resultsContainer.children).forEach(div => {
    div.addEventListener('click', () => {
      window.location.href = `/user/${div.dataset.id}`;
    });
  });
});


  document.querySelectorAll(".followBtn").forEach(button => {
    button.addEventListener("click", async () => {
      console.log("Follow button clicked!");
      const targetUserId = button.dataset.userid;

      try {
        const res = await fetch("/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId })
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Follow/unfollow failed");
        }

        const data = await res.json();

        console.log("Server response:", data);

        if (data.success) {
          if (data.following) {
            button.textContent = "Following";
            button.classList.add("following");
            button.classList.remove("follow");
          } else {
            button.textContent = "Follow";
            button.classList.add("follow");
            button.classList.remove("following");
          }
        } else {
          alert("Could not update follow status.");
        }

      } catch (err) {
        console.error("Follow error:", err);
        alert("Error. Please try again.");
      }
    });
  });
});
// Dynamic follow buttons in suggestion sidebar
document.querySelectorAll("#suggestion-container .followBtn").forEach(button => {
  button.addEventListener("click", async () => {
    const userId = button.dataset.userid;
    try {
      const res = await fetch("/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId })
      });

      const data = await res.json();
      if (data.success) {
        button.textContent = data.following ? "Following" : "Follow";
        button.classList.toggle("following", data.following);
        button.classList.toggle("follow", !data.following);
      }
    } catch (err) {
      alert("Failed to update follow status.");
    }
  });
});

// Clickable usernames/images in sidebar → redirect to profile
document.querySelectorAll(".user-info").forEach(div => {
  div.addEventListener("click", () => {
    const userId = div.dataset.id;
    window.location.href = `/user/${userId}`;
  });
});
