from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Mengizinkan akses request dari frontend portofolio
CORS(app)

@app.route('/api/contact', methods=['POST'])
def handle_contact():
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    # Validasi Input Sederhana
    if not name or not email or not message:
        return jsonify({"error": "Semua field harus diisi!"}), 400

    # Log pesan masuk di terminal backend
    print("=" * 40)
    print("📩 PESAN BARU DARI PORTOFOLIO:")
    print(f"Dari    : {name} ({email})")
    print(f"Pesan   : {message}")
    print("=" * 40)

    # Catatan: Di sini lu bisa integrasikan modul telegram bot atau email smtp
    return jsonify({
        "status": "success",
        "message": f"Terima kasih {name}, pesan Anda berhasil diterima!"
    }), 200

if __name__ == '__main__':
    # Jalankan server lokal di port 5000
    print("🚀 Server Flask Portofolio berjalan di http://127.0.0.1:5000")
    app.run(debug=True, port=5000)