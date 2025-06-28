document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".followBtn").forEach(button => {
    button.addEventListener("click", async () => {
      const targetUserId = button.dataset.userid;

      try {
        const res = await fetch("/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId })
        });

        if (!res.ok) throw new Error("Failed to follow");

        const data = await res.json();

        if (data.success) {
          button.textContent = "Following";
          button.classList.add("following");
          location.reload();
        } else {
          alert("Could not follow the user.");
        }
      } catch (err) {
        console.error("Error following:", err);
        alert("Error. Please try again.");
      }
    });
  });
});
