const STORAGE_KEY = "cifera_vault_packets";
const syncChannel = new BroadcastChannel("cifera_amphoreus_bus");

let currentChannel = "okhema";
let selectedFile = null;

// Koleksi 6 Stiker Karakter Cipher (Cifera) Honkai: Star Rail
const CIPHER_STICKERS = [
  {
    id: "smug_coin",
    label: "Hehe~ Gotcha!",
    svg: `<svg viewBox="0 0 100 100" width="76" height="76">
      <path d="M22 42 L15 12 L40 28 Q50 24 60 28 L85 12 L78 42 C86 55 82 80 50 86 C18 80 14 55 22 42 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="50" cy="54" r="24" fill="#f8fafc"/>
      <path d="M30 48 Q42 34 50 46 Q58 34 70 48" fill="#94a3b8"/>
      <ellipse cx="41" cy="54" rx="4" ry="5" fill="#0284c7"/>
      <path d="M55 54 Q60 50 65 54" stroke="#0284c7" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M44 65 Q50 71 57 64" stroke="#334155" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="76" cy="28" r="12" fill="#f5c451" stroke="#fef08a" stroke-width="2"/>
      <text x="76" y="32" text-anchor="middle" font-size="12" font-weight="bold" fill="#78350f">🪙</text>
    </svg>`
  },
  {
    id: "treasure_hoard",
    label: "Harta Milikku!",
    svg: `<svg viewBox="0 0 100 100" width="76" height="76">
      <circle cx="25" cy="76" r="11" fill="#f5c451" stroke="#fef08a" stroke-width="1.5"/>
      <circle cx="75" cy="76" r="11" fill="#f5c451" stroke="#fef08a" stroke-width="1.5"/>
      <circle cx="50" cy="80" r="12" fill="#fbbf24" stroke="#fef08a" stroke-width="1.5"/>
      <path d="M24 40 L18 12 L42 26 Q50 22 58 26 L82 12 L76 40 C82 52 78 70 50 74 C22 70 18 52 24 40 Z" fill="#1e293b" stroke="#f5c451" stroke-width="2.5"/>
      <circle cx="50" cy="48" r="21" fill="#f8fafc"/>
      <text x="41" y="51" text-anchor="middle" font-size="12" fill="#f59e0b">✦</text>
      <text x="59" y="51" text-anchor="middle" font-size="12" fill="#f59e0b">✦</text>
      <path d="M43 58 Q50 66 57 58 Z" fill="#f43f5e"/>
    </svg>`
  },
  {
    id: "shadow_vanish",
    label: "Kabur Bayangan!",
    svg: `<svg viewBox="0 0 100 100" width="76" height="76">
      <circle cx="50" cy="52" r="34" fill="#38bdf8" opacity="0.18"/>
      <path d="M18 68 Q35 58 50 68 Q65 78 82 66" stroke="#38bdf8" stroke-width="3" fill="none" stroke-dasharray="5 3"/>
      <path d="M26 38 L20 12 L42 25 Q50 22 58 25 L80 12 L74 38 C80 50 74 68 50 72 C26 68 20 50 26 38 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
      <ellipse cx="41" cy="48" rx="4.5" ry="5.5" fill="#38bdf8"/>
      <ellipse cx="59" cy="48" rx="4.5" ry="5.5" fill="#38bdf8"/>
      <path d="M44 59 L50 63 L56 59" stroke="#f5c451" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "secret_shh",
    label: "Sstt... Rahasia!",
    svg: `<svg viewBox="0 0 100 100" width="76" height="76">
      <path d="M22 42 L16 14 L40 28 Q50 24 60 28 L84 14 L78 42 C85 56 80 80 50 86 C20 80 15 56 22 42 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="50" cy="53" r="23" fill="#f8fafc"/>
      <ellipse cx="41" cy="51" rx="4" ry="5" fill="#0284c7"/>
      <ellipse cx="59" cy="51" rx="4" ry="5" fill="#0284c7"/>
      <rect x="47" y="57" width="6" height="16" rx="3" fill="#fed7aa" stroke="#94a3b8" stroke-width="1"/>
      <text x="78" y="34" font-size="14" fill="#38bdf8" font-weight="bold">?</text>
    </svg>`
  },
  {
    id: "lucky_flip",
    label: "Lempar Koin!",
    svg: `<svg viewBox="0 0 100 100" width="76" height="76">
      <circle cx="50" cy="20" r="13" fill="#f5c451" stroke="#fef08a" stroke-width="2"/>
      <text x="50" y="24" text-anchor="middle" font-size="12" font-weight="bold" fill="#78350f">Z</text>
      <path d="M50 36 L50 44" stroke="#fde047" stroke-width="2" stroke-dasharray="2 2"/>
      <path d="M25 54 L20 30 L42 42 Q50 39 58 42 L80 30 L75 54 C80 68 74 86 50 90 C26 86 20 68 25 54 Z" fill="#1e293b" stroke="#f5c451" stroke-width="2.5"/>
      <circle cx="50" cy="64" r="20" fill="#f8fafc"/>
      <path d="M38 62 Q42 57 46 62" stroke="#0284c7" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M54 62 Q58 57 62 62" stroke="#0284c7" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M44 71 Q50 77 56 71" stroke="#334155" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "cat_stare",
    label: "Mengawasi...",
    svg: `<svg viewBox="0 0 100 100" width="76" height="76">
      <rect x="14" y="26" width="72" height="52" rx="14" fill="#090d16" stroke="#38bdf8" stroke-width="2.5"/>
      <path d="M24 26 L18 10 L38 24 Z" fill="#090d16" stroke="#38bdf8" stroke-width="2"/>
      <path d="M76 26 L82 10 L62 24 Z" fill="#090d16" stroke="#38bdf8" stroke-width="2"/>
      <ellipse cx="36" cy="52" rx="7" ry="9" fill="#38bdf8"/>
      <ellipse cx="64" cy="52" rx="7" ry="9" fill="#38bdf8"/>
      <ellipse cx="36" cy="52" rx="2" ry="7" fill="#090d16"/>
      <ellipse cx="64" cy="52" rx="2" ry="7" fill="#090d16"/>
    </svg>`
  }
];

// Kutipan Acak Koin Zagreus
const ZAGREUS_QUOTES = [
  '"Kepala atau ekor? Semuanya milikku~"',
  '"Kecepatan adalah segalanya di Okhema!"',
  '"Sandi yang bagus... takkan bisa dilacak."',
  '"Tipu daya kecil menyelamatkan hari!"',
  '"Koin emas berputar, rahasia terkunci."'
];

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
const stickerDrawer = document.getElementById("sticker-drawer");
const stickerGrid = document.getElementById("sticker-grid");
const zagreusCoin = document.getElementById("zagreus-coin");
const coinQuote = document.getElementById("coin-quote");

// Inisialisasi Nama Samaran
const aliases = ["Cifera", "Heir_Zagreus", "Okhema_Cat", "Shadow_Coin"];
usernameInput.value = aliases[Math.floor(Math.random() * aliases.length)] + "_" + Math.floor(10 + Math.random() * 89);
updateProfileUI();

function updateProfileUI() {
  const name = usernameInput.value.trim() || "Phantom";
  displayUsername.textContent = name;
  userAvatar.textContent = name.charAt(0).toUpperCase();
}

usernameInput.addEventListener("input", updateProfileUI);
secretKeyInput.addEventListener("input", renderAllMessages);

// Interaksi Lempar Koin Zagreus 3D di Sidebar
zagreusCoin.addEventListener("click", () => {
  zagreusCoin.classList.remove("flipping");
  void zagreusCoin.offsetWidth; // trigger reflow animasi
  zagreusCoin.classList.add("flipping");
  const randomQuote = ZAGREUS_QUOTES[Math.floor(Math.random() * ZAGREUS_QUOTES.length)];
  coinQuote.textContent = randomQuote;
});

// Toggle Intip Kunci Inti Api
document.getElementById("btn-toggle-key").addEventListener("click", () => {
  secretKeyInput.type = secretKeyInput.type === "password" ? "text" : "password";
});

// Coin of Whimsy (Sidebar Kiri): Generate Kunci Acak
document.getElementById("btn-gen-key").addEventListener("click", () => {
  zagreusCoin.click();
  const newKey = CiferaCrypto.generateWhimsyKey();
  secretKeyInput.value = newKey;
  secretKeyInput.type = "text";
  renderAllMessages();
  alert(`🪙 Coin of Whimsy dilempar!\nKunci Inti Api baru dibuat:\n\n${newKey}\n\nBagikan kunci ini ke tab/temanmu untuk membuka pesan.`);
});

// Render Laci Stiker Cipher
function initStickerDrawer() {
  stickerGrid.innerHTML = "";
  CIPHER_STICKERS.forEach((st) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sticker-item";
    btn.innerHTML = `${st.svg}<span>${st.label}</span>`;
    btn.addEventListener("click", async () => {
      stickerDrawer.classList.add("hidden");
      await sendEncryptedPayload({ stickerId: st.id });
    });
    stickerGrid.appendChild(btn);
  });
}
initStickerDrawer();

document.getElementById("btn-sticker-toggle").addEventListener("click", () => {
  stickerDrawer.classList.toggle("hidden");
});

document.getElementById("btn-close-sticker").addEventListener("click", () => {
  stickerDrawer.classList.add("hidden");
});

// Navigasi Channel
document.querySelectorAll(".channel-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".channel-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentChannel = btn.dataset.channel;
    const labelName = btn.innerText.replace("#", "").trim();
    document.getElementById("current-channel-title").textContent = `# ${labelName}`;
    document.getElementById("channel-desc").textContent = btn.dataset.desc;
    messageInput.placeholder = `Bisikkan pesan terenkripsi ke #${labelName}...`;
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

// Fungsi Utama Segel & Kirim (Teks, File, maupun Stiker)
async function sendEncryptedPayload({ text = "", filePayload = null, stickerId = null }) {
  const passphrase = secretKeyInput.value;
  if (!passphrase) {
    alert("Masukkan Kunci Inti Api (Coreflame Key) terlebih dahulu!");
    return;
  }

  const sealedPacket = await CiferaCrypto.sealPacket({
    senderName: usernameInput.value.trim() || "Unknown_Heir",
    isAnonymous: anonModeCheckbox.checked,
    text,
    filePayload,
    stickerId,
    passphrase,
    channel: currentChannel,
  });

  const allPackets = getStoredPackets();
  allPackets.push(sealedPacket);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allPackets));
  syncChannel.postMessage({ type: "NEW_SEAL" });
  renderAllMessages();
}

// Submit Form Chat
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text && !selectedFile) return;

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

  await sendEncryptedPayload({ text, filePayload });
  messageInput.value = "";
  clearFileSelection();
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

// Render Pesan, Stiker Terdekripsi, & Okhema Public Ledger
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
    // 1. Panel Inspector (Sisi Server/Pengintai)
    const packetEl = document.createElement("div");
    packetEl.className = "packet-box";
    packetEl.innerHTML = `
      <div><span>Pengirim Publik:</span> ${packet.publicMask}</div>
      <div><span>Vektor Ilusi (IV):</span> ${packet.iv}</div>
      <div><span>Sandi (Ciphertext):</span> ${packet.ciphertext.slice(0, 88)}...</div>
    `;
    inspectorContent.prepend(packetEl);

    // 2. Dekripsi di Sisi Penerima
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

      let stickerHTML = "";
      if (unsealed.stickerId) {
        const foundSticker = CIPHER_STICKERS.find((s) => s.id === unsealed.stickerId);
        if (foundSticker) {
          stickerHTML = `
            <div class="sticker-message">
              ${foundSticker.svg}
              <span class="sticker-caption">${escapeHTML(foundSticker.label)}</span>
            </div>
          `;
        }
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
        ${stickerHTML}
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
    "2. Enkripsi Pesan, Stiker & Artefak: AES-256-GCM (Authenticated Encryption)\n" +
    "3. Keutuhan File (Golden Fleece Seal): Hash SHA-256 + Enkripsi Metadata Nama File\n" +
    "4. Kerahasiaan Pengirim (Veil of Zagreus): Sealed Sender — identitas pengirim dienkripsi di dalam payload sehingga server hanya melihat 'Shadow-Courier [Hidden]'."
  );
});

renderAllMessages();
