
// Auto scroll to latest message
  const msgBox = document.querySelector('.chat-messages');
  msgBox.scrollTop = msgBox.scrollHeight;
  
document.getElementById('chatForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const toUserId = form.toUserId.value;
  const text = form.text.value.trim();

  if (!text) return;

  const res = await fetch('/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toUserId, text })
  });

  if (res.ok) {
    form.text.value = '';
    location.reload();  // Or append the message dynamically!
  }
});
