// KODE BARU (Aman via Vercel Backend)
const response = await fetch('/api/send-telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: nameInput.value,
    email: emailInput.value,
    message: messageInput.value
  })
});

const result = await response.json();
if (response.ok) {
  alert('Pesan berhasil terkirim!');
} else {
  alert('Gagal mengirim pesan: ' + result.error);
}