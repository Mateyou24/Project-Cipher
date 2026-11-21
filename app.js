const STORAGE_KEY = "cifera_vault_packets";
const syncChannel = new BroadcastChannel("cifera_amphoreus_bus");

let currentChannel = "okhema";
let selectedFile = null;

// Elemen DOM
const usernameInput = document.getElementById("username-input");
const secretKeyInput = document.getElementById("secret-key-input");
const anonModeCheckbox = document.getElementById("anon-mode");
const displayUsername = document.getElementById("display-username");
const userAvatar = document.getElementById("user-avatar");
const messagesContainer = document.getElementById("messages-container");
const inspectorContent = document.getElementById("inspector-content");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const fileInput = document.getElementById("file-input");
const filePreview = document.getElementById("file-preview");
const filePreviewName = document.getElementById("file-preview-name");

// Inisialisasi nama samaran bertema Amphoreus
const aliases = ["Cifera", "Heir_Zagreus", "Okhema_Cat", "Shadow_Coin"];
const randomAlias = aliases[Math.floor(Math.random() * aliases.length)] + "_" + Math.floor(10 + Math.random() * 89);
usernameInput.value = randomAlias;
updateProfileUI();

function updateProfileUI() {
  const name = usernameInput.value.trim() || "Phantom";
  displayUsername.textContent = name;
  userAvatar.textContent = name.charAt(0).toUpperCase();
}

usernameInput.addEventListener("input", updateProfileUI);
secretKeyInput.addEventListener("input", renderAllMessages);

// Toggle Intip Kunci Inti Api
document.getElementById("btn-toggle-key").addEventListener("click", () => {
  secretKeyInput.type = secretKeyInput.type === "password" ? "text" : "password";
});

// Coin of Whimsy: Generate kunci acak baru
document.getElementById("btn-gen-key").addEventListener("click", () => {
  const newKey = CiferaCrypto.generateWhimsyKey();
  secretKeyInput.value = newKey;
  secretKeyInput.type = "text";
  renderAllMessages();
  alert(`🪙 Coin of Whimsy dilempar!\nKunci Inti Api baru dibuat:\n\n${newKey}\n\nBagikan kunci ini ke tab/temanmu untuk membuka pesan.`);
});

// Navigasi Channel
document.querySelectorAll(".channel-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".channel-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentChannel = btn.dataset.channel;
    document.getElementById("current-channel-title").textContent = `# ${btn.dataset.channel === "okhema" ? "okhema-alley" : btn.dataset.channel === "fleece" ? "golden-fleece-loot" : "shadow-whispers"}`;
    document.getElementById("channel-desc").textContent = btn.dataset.desc;
    messageInput.placeholder = `Bisikkan pesan terenkripsi ke #${btn.innerText.replace("#", "").trim()}...`;
    renderAllMessages();
  });
});

// Penanganan Pilih File
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) {
    alert("Batas ukuran artefak untuk simulasi localStorage adalah 3 MB.");
    fileInput.value = "";
    return;
  }
  selectedFile = file;
  filePreviewName.textContent = `🪙 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  filePreview.classList.remove("hidden");
});

document.getElementById("btn-remove-file").addEventListener("click", clearFileSelection);

function clearFileSelection() {
  selectedFile = null;
  fileInput.value = "";
  filePreview.classList.add("hidden");
}

// Segel & Kirim Pesan/File
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  const passphrase = secretKeyInput.value;

  if (!text && !selectedFile) return;
  if (!passphrase) {
    alert("Masukkan Kunci Inti Api (Coreflame Key) terlebih dahulu!");
    return;
  }

  let filePayload = null;
  if (selectedFile) {
    const arrayBuffer = await selectedFile.arrayBuffer();
    const sha256 = await CiferaCrypto.computeSHA256(arrayBuffer);
    filePayload = {
      name: selectedFile.name,
      type: selectedFile.type || "application/octet-stream",
      base64Data: CiferaCrypto.bufferToBase64(arrayBuffer),
      sha256,
    };
  }

  const sealedPacket = await CiferaCrypto.sealPacket({
    senderName: usernameInput.value.trim() || "Unknown_Heir",
    isAnonymous: anonModeCheckbox.checked,
    text,
    filePayload,
    passphrase,
    channel: currentChannel,
  });

  const allPackets = getStoredPackets();
  allPackets.push(sealedPacket);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allPackets));
  syncChannel.postMessage({ type: "NEW_SEAL" });

  messageInput.value = "";
  clearFileSelection();
  renderAllMessages();
});

function getStoredPackets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Render Pesan & Okhema Public Ledger
async function renderAllMessages() {
  const packets = getStoredPackets().filter((p) => p.channel === currentChannel);
  const passphrase = secretKeyInput.value;

  messagesContainer.innerHTML = "";
  inspectorContent.innerHTML = "";

  if (packets.length === 0) {
    inspectorContent.innerHTML = `<div class="empty-inspector">Belum ada jejak sandi di saluran ini.</div>`;
    return;
  }

  for (const packet of packets) {
    // 1. Tampilkan Ciphertext di Okhema Public Ledger (Sisi Server)
    const packetEl = document.createElement("div");
    packetEl.className = "packet-box";
    packetEl.innerHTML = `
      <div><span>Pengirim Publik:</span> ${packet.publicMask}</div>
      <div><span>Vektor Ilusi (IV):</span> ${packet.iv}</div>
      <div><span>Sandi (Ciphertext):</span> ${packet.ciphertext.slice(0, 88)}...</div>
    `;
    inspectorContent.prepend(packetEl);

    // 2. Coba Buka Segel di Sisi Penerima
    const msgEl = document.createElement("div");
    try {
      const unsealed = await CiferaCrypto.unsealPacket(packet, passphrase);
      msgEl.className = unsealed.isAnonymous ? "message-card anon-card" : "message-card";

      let fileHTML = "";
      if (unsealed.file) {
        const blob = new Blob([CiferaCrypto.base64ToBuffer(unsealed.file.base64Data)], {
          type: unsealed.file.type,
        });
        const downloadUrl = URL.createObjectURL(blob);
        const statusText = unsealed.file.integrityValid
          ? `✦ Segel Golden Fleece Valid (SHA-256: ${unsealed.file.sha256.slice(0, 14)}...)`
          : `⚠️ PERINGATAN: Artefak telah dimodifikasi!`;

        fileHTML = `
          <div class="file-attachment">
            <div class="file-info">
              <strong>🪙 ${escapeHTML(unsealed.file.name)}</strong>
              <small>${statusText}</small>
            </div>
            <a href="${downloadUrl}" download="${escapeHTML(unsealed.file.name)}" class="btn-download">Ambil Artefak</a>
          </div>
        `;
      }

      const senderClass = unsealed.isAnonymous ? "msg-sender phantom" : "msg-sender";
      const badgeClass = unsealed.isAnonymous ? "msg-badge gold" : "msg-badge";
      const badgeLabel = unsealed.isAnonymous ? "🎭 Veil of Zagreus (Anonim)" : "🐾 Sealed by Trickery";

      msgEl.innerHTML = `
        <div class="msg-meta">
          <span class="${senderClass}">${escapeHTML(unsealed.realSender)}</span>
          <span class="${badgeClass}">${badgeLabel}</span>
          <span class="msg-time">${unsealed.timestamp}</span>
        </div>
        ${unsealed.text ? `<div class="msg-body">${escapeHTML(unsealed.text)}</div>` : ""}
        ${fileHTML}
      `;
    } catch (err) {
      msgEl.className = "message-card failed";
      msgEl.innerHTML = `
        <div class="msg-meta">
          <span class="msg-sender">🔒 Terkunci oleh Kabut Zagreus</span>
          <span class="msg-badge">Kunci Inti Api Salah</span>
        </div>
        <div class="msg-body"><code>${escapeHTML(packet.ciphertext.slice(0, 64))}...</code></div>
      `;
    }

    messagesContainer.appendChild(msgEl);
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

syncChannel.onmessage = () => renderAllMessages();
window.addEventListener("storage", () => renderAllMessages());

document.getElementById("btn-clear").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  syncChannel.postMessage({ type: "CLEAR" });
  renderAllMessages();
});

document.getElementById("btn-info").addEventListener("click", () => {
  alert(
    "📜 Protokol Kriptografi CIFERA // VAULT:\n\n" +
    "1. Key Derivation: PBKDF2-SHA256 (100.000 iterasi dari Coreflame Key)\n" +
    "2. Enkripsi Pesan & Artefak: AES-256-GCM (Authenticated Encryption)\n" +
    "3. Keutuhan File (Golden Fleece Seal): Hash SHA-256 + Enkripsi Metadata Nama File\n" +
    "4. Kerahasiaan Pengirim (Veil of Zagreus): Sealed Sender — identitas pengirim dienkripsi di dalam payload sehingga server hanya melihat 'Shadow-Courier [Hidden]'."
  );
});

renderAllMessages();
