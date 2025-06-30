document.addEventListener("DOMContentLoaded", () => {
  console.log("home.js loaded and DOM ready!");

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
