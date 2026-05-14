(function () {
    // 1. Load Font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap';
    document.head.appendChild(fontLink);

    // 2. Get Config from the Window object
    const config = window.ChatWidgetConfig || {
        webhook: { url: '' },
        branding: { logo: "https://www.shutterstock.com/image-vector/chat-bot-icon-virtual-smart-600nw-2478937553.jpg", names: 'Hasan', welcomeText: 'Hai! Ada apa yang boleh saya bantu?', inputText: 'Taip mesej anda...' },
        style: { primaryColor: '#854fff' }
    };

    // 3. Inject Enhanced Styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .naten-chat-wrapper {
            font-family: 'Sora', sans-serif;
            --primary: ${config.style.primaryColor};
            --secondary: ${config.style.secondaryColor || config.style.primaryColor};
        }
        .naten-chat-toggle {
            position: fixed; bottom: 32px; right: 32px;
            width: 64px; height: 64px; border-radius: 50%;
            background: var(--primary); color: white; border: none; cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease; 
        }
        .naten-chat-box {
            position: fixed; bottom: 110px; right: 32px;
            width: 380px; height: 580px; border-radius: 24px;
            background: #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.1); 
            display: none; flex-direction: column; z-index: 9999; overflow: hidden;
            border: 1px solid #d1d5db; 
        }
        .naten-chat-box.active { display: flex; }
        .naten-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; background-color: #f9fafb; }
        .naten-msg { max-width: 80%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
        .naten-msg.user { background: var(--primary); color: white; align-self: flex-end; }
        .naten-msg.bot { background: white; color: #333; align-self: flex-start; border: 1px solid #eee; }
        
        .naten-typing-indicator {
            background: white; border: 1px solid #eee; align-self: flex-start;
            display: none; items-center: center; gap: 4px; padding: 12px 16px; border-radius: 16px;
        }
        .naten-typing-dot { width: 6px; height: 6px; background: #888; border-radius: 50%; animation: natenBounce 1.4s infinite ease-in-out both; }
        .naten-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .naten-typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes natenBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }

        .naten-input-area { padding: 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: #fff; transition: background 0.2s; }
        .naten-input-area.disabled-bg { background-color: #f3f4f6 !important; }
        #naten-in:disabled { background: transparent; cursor: not-allowed; }

        .naten-btn-wrapper { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px; }
        .naten-btn { padding: 8px 12px; border-radius: 20px; border: 1px solid var(--primary); background: white; color: var(--primary); cursor: pointer; font-size: 12px; transition: 0.2s; }
        .naten-btn:hover { background: var(--primary); color: white; }

        .naten-form { background: #fff; padding: 15px; border-radius: 15px; border: 1px solid #eee; width: 90%; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .naten-form input, .naten-form select { width: 100%; padding: 8px; margin: 6px 0; border: 1px solid #ddd; border-radius: 8px; font-family: 'Sora'; box-sizing: border-box; }
        .naten-form button { width: 100%; padding: 10px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 10px; }
    `;
    document.head.appendChild(styleSheet);

    let internalState = "CHOOSE_FLOW";
    let userName = "";

    const wrapper = document.createElement('div');
    wrapper.className = 'naten-chat-wrapper';
    wrapper.innerHTML = `
        <button class="naten-chat-toggle"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></button>
        <div class="naten-chat-box">
            <div style="padding:20px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:10px;">
                <img src="${config.branding.logo}" style="width:30px; height:30px; border-radius:50%;">
                <div style="font-weight:700;">${config.branding.names || 'Hasan'}</div>
            </div>
            <div class="naten-messages" id="naten-ms"></div>
            <div class="naten-input-area" id="naten-input-container">
                <input type="text" id="naten-in" placeholder="${config.branding.inputText}" style="flex:1; border:none; outline:none;">
                <button id="naten-send" style="background:none; border:none; cursor:pointer;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(wrapper);

    const msgs = document.getElementById('naten-ms');
    const input = document.getElementById('naten-in');
    const sendBtn = document.getElementById('naten-send');
    const inputContainer = document.getElementById('naten-input-container');

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'naten-typing-indicator';
    typingIndicator.innerHTML = '<div class="naten-typing-dot"></div><div class="naten-typing-dot"></div><div class="naten-typing-dot"></div>';

    wrapper.querySelector('.naten-chat-toggle').onclick = () => wrapper.querySelector('.naten-chat-box').classList.toggle('active');

    function toggleChatInput(disable, reason = "BUTTONS") {
        input.disabled = disable;
        sendBtn.disabled = disable;
        inputContainer.classList.toggle('disabled-bg', disable);
        input.placeholder = disable ? (reason === "FORM" ? "Sila isi borang di atas dahulu..." : "Sila buat pilihan di atas dahulu...") : config.branding.inputText;
    }

    function showTyping(show) {
        if (show) { msgs.appendChild(typingIndicator); typingIndicator.style.display = 'flex'; }
        else { typingIndicator.style.display = 'none'; }
        msgs.scrollTop = msgs.scrollHeight;
    }

    async function apiCall(payload) {
        const res = await fetch(config.webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        return await res.json();
    }

    function renderBotResponse(data) {
        showTyping(false);
        if (data.text) msgs.innerHTML += `<div class="naten-msg bot">${data.text}</div>`;

        if (data.buttons) {
            toggleChatInput(true, "BUTTONS");
            const btnWrap = document.createElement('div');
            btnWrap.className = 'naten-btn-wrapper';
            data.buttons.forEach(b => {
                const btn = document.createElement('button');
                btn.className = 'naten-btn'; btn.innerText = b;
                btn.onclick = () => { btnWrap.remove(); toggleChatInput(false); handleSendMessage(b); };
                btnWrap.appendChild(btn);
            });
            msgs.appendChild(btnWrap);
        }

        if (data.form) {
            toggleChatInput(true, "FORM");
            const fDiv = document.createElement('div');
            fDiv.className = 'naten-form';
            let html = `<div style="font-weight:600; margin-bottom:10px;">${data.form.title}</div>`;
            data.form.fields.forEach(f => {
                html += `<div style="margin-bottom:8px;"><label style="font-size:11px; color:#666;">${f.label}</label>`;
                if (f.type === 'select') {
                    html += `<select id="f-${f.name}">${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
                } else {
                    html += `<input type="${f.type || 'text'}" id="f-${f.name}" placeholder="${f.label}">`;
                }
                html += `</div>`;
            });
            html += `<button id="f-sub">Submit</button>`;
            fDiv.innerHTML = html;
            fDiv.querySelector('#f-sub').onclick = () => {
                const res = {}; let txt = `**${data.form.title}**\n`;
                data.form.fields.forEach(f => { const v = fDiv.querySelector(`#f-${f.name}`).value; res[f.name] = v; if (v) txt += `• ${f.label}: ${v}\n`; });
                fDiv.remove(); toggleChatInput(false); handleSendMessage(txt, res);
            };
            msgs.appendChild(fDiv);
        }
        msgs.scrollTop = msgs.scrollHeight;
    }

    async function handleSendMessage(display, hidden = null) {
        const val = display || input.value.trim(); if (!val) return;
        msgs.innerHTML += `<div class="naten-msg user">${val}</div>`;
        input.value = ''; msgs.scrollTop = msgs.scrollHeight;

        if (internalState === "AWAITING_NAME") {
            userName = val; internalState = "READY_FOR_N8N"; showTyping(true);
            setTimeout(() => { showTyping(false); msgs.innerHTML += `<div class="naten-msg bot">Terima kasih ${userName}. Bagaimana saya boleh bantu anda hari ini?</div>`; }, 800);
            return;
        }

        showTyping(true);
        const data = await apiCall(hidden ? { formResponse: hidden, name: userName } : { chatInput: val, name: userName });
        renderBotResponse(data);
    }

    function instantiateLocalForm() {
        toggleChatInput(true, "FORM");
        const fDiv = document.createElement('div');
        fDiv.className = 'naten-form';
        fDiv.innerHTML = `
            <div style="font-weight:600; margin-bottom:10px;">Borang Aduan Rasmi</div>
            <input type="text" id="f-name" placeholder="Nama Penuh">
            <input type="number" id="f-phone" placeholder="No. Telefon" inputmode="decimal">
            <input type="email" id="f-email" placeholder="Emel (Optional)">
            <input type="text" id="f-address" placeholder="Alamat Penuh">
            <label style="font-size:11px; color:#666;">Kategori Aduan</label>
            <select id="f-cat"><option>Lampu Jalan</option><option>Sampah</option><option>Jalan Berlubang</option><option>Lain-lain</option></select>
            <input type="text" id="f-details" placeholder="Butiran Aduan">
            <button id="f-sub">Submit</button>
        `;
        fDiv.querySelector('#f-sub').onclick = async () => {
            const res = { name: fDiv.querySelector('#f-name').value, phone: fDiv.querySelector('#f-phone').value, email: fDiv.querySelector('#f-email').value, address: fDiv.querySelector('#f-address').value, category: fDiv.querySelector('#f-cat').value, reason: fDiv.querySelector('#f-details').value };
            if (!res.name || !res.phone || !res.address) { alert("Sila isi maklumat wajib."); return; }
            fDiv.remove(); toggleChatInput(false); internalState = "READY_FOR_N8N";
            handleSendMessage(`**Borang Aduan**\n• Nama: ${res.name}\n• No: ${res.phone}\n• Kategori: ${res.category}`, res);
        };
        msgs.appendChild(fDiv);
    }

    function init() {
        msgs.innerHTML = `<div class="naten-msg bot">${config.branding.welcomeText}</div>`;
        toggleChatInput(true);
        const btnWrap = document.createElement('div'); btnWrap.className = 'naten-btn-wrapper';
        ["Pertanyaan", "Aduan"].forEach(l => {
            const b = document.createElement('button'); b.className = 'naten-btn'; b.innerText = l;
            b.onclick = () => {
                btnWrap.remove(); msgs.innerHTML += `<div class="naten-msg user">${l}</div>`;
                if (l === "Aduan") { msgs.innerHTML += `<div class="naten-msg bot">Sila isi borang di bawah:</div>`; instantiateLocalForm(); }
                else { internalState = "AWAITING_NAME"; msgs.innerHTML += `<div class="naten-msg bot">Sila nyatakan nama anda:</div>`; toggleChatInput(false); }
            };
            btnWrap.appendChild(b);
        });
        msgs.appendChild(btnWrap);
    }

    init();
    sendBtn.onclick = () => handleSendMessage();
    input.onkeypress = (e) => { if (e.key === 'Enter' && !input.disabled) handleSendMessage(); };
})();