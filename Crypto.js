/**
 * CIFERA // VAULT — Trickery Cryptographic Engine (Web Crypto API)
 * 1. PBKDF2-SHA256 : Menurunkan kunci AES-256 dari Coreflame Passphrase.
 * 2. AES-256-GCM   : Enkripsi & autentikasi pesan, file, serta identitas pengirim.
 * 3. SHA-256       : Segel integritas Golden Fleece untuk keutuhan isi file.
 * 4. Coin of Whimsy: Generator kunci acak berbasis CSPRNG (crypto.getRandomValues).
 */

const CiferaCrypto = {
  bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  },

  base64ToBuffer(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  },

  // Coin of Whimsy: Membuat Passphrase Acak Aman Secara Kriptografis
  generateWhimsyKey() {
    const prefixes = ["Cifera", "Zagreus", "Okhema", "Chrysos", "Trickery"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomBytes = crypto.getRandomValues(new Uint8Array(6));
    const hex = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${prefix}-${hex.slice(0, 6)}-${hex.slice(6)}`;
  },

  // Menghitung Hash SHA-256 (Golden Fleece Integrity Seal)
  async computeSHA256(arrayBuffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },

  // Derivasi Kunci AES-256 dari Passphrase menggunakan PBKDF2
  async deriveKey(passphrase, saltBytes) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  },

  // Enkripsi Paket (Pesan + File + Sealed Sender)
  async sealPacket({ senderName, isAnonymous, text, filePayload, passphrase, channel }) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const aesKey = await this.deriveKey(passphrase, salt);

    // Identitas asli pengirim dimasukkan ke dalam amplop terenkripsi
    const innerEnvelope = {
      realSender: isAnonymous ? "Phantom Thief [Veil of Zagreus]" : senderName,
      isAnonymous,
      text,
      file: filePayload,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    const encoder = new TextEncoder();
    const encodedEnvelope = encoder.encode(JSON.stringify(innerEnvelope));

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      encodedEnvelope
    );

    // Paket yang beredar di jaringan publik: tanpa nama pengirim & tanpa nama file asli
    return {
      id: crypto.randomUUID(),
      channel,
      publicMask: "Shadow-Courier [Hidden]",
      salt: this.bufferToBase64(salt),
      iv: this.bufferToBase64(iv),
      ciphertext: this.bufferToBase64(ciphertextBuffer),
      createdAt: Date.now(),
    };
  },

  // Dekripsi Paket & Validasi Segel File
  async unsealPacket(packet, passphrase) {
    const salt = new Uint8Array(this.base64ToBuffer(packet.salt));
    const iv = new Uint8Array(this.base64ToBuffer(packet.iv));
    const ciphertext = this.base64ToBuffer(packet.ciphertext);

    const aesKey = await this.deriveKey(passphrase, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      ciphertext
    );

    const decoder = new TextDecoder();
    const envelope = JSON.parse(decoder.decode(decryptedBuffer));

    if (envelope.file) {
      const rawFileBuffer = this.base64ToBuffer(envelope.file.base64Data);
      const recalculatedHash = await this.computeSHA256(rawFileBuffer);
      envelope.file.integrityValid = recalculatedHash === envelope.file.sha256;
    }

    return envelope;
  },
};