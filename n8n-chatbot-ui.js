(function() {
    // 1. Load Font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap';
    document.head.appendChild(fontLink);

    // 2. Get Config from the Window object
    const config = window.ChatWidgetConfig || {
        webhook: { url: '' },
        branding: { name: 'AI Assistant', welcomeText: 'Hello!' },
        style: { primaryColor: '#854fff' }
    };

    // 3. Inject Enhanced Styles (Glassmorphism + Sora)
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .eden-chat-wrapper {
            font-family: 'Sora', sans-serif;
            --primary: ${config.style.primaryColor};
            --secondary: ${config.style.secondaryColor || config.style.primaryColor};
        }
        .eden-chat-toggle {
            position: fixed; bottom: 32px; ${config.style.position}: 32px;
            width: 64px; height: 64px; border-radius: 50%;
            background: var(--primary); color: white; border: none; cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999;
        }
        .eden-chat-box {
            position: fixed; bottom: 110px; ${config.style.position}: 32px;
            width: 380px; height: 580px; border-radius: 24px;
            background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.1); display: none;
            flex-direction: column; z-index: 9999; overflow: hidden;
            border: 1px solid rgba(255,255,255,0.5);
        }
        .eden-chat-box.active { display: flex; }
        .eden-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .eden-msg { max-width: 80%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
        .eden-msg.user { background: var(--primary); color: white; align-self: flex-end; }
        .eden-msg.bot { background: white; color: #333; align-self: flex-start; border: 1px solid #eee; }
        
        /* Materialized Buttons */
        .eden-btn { 
            padding: 8px 12px; border-radius: 20px; border: 1px solid var(--primary);
            background: white; color: var(--primary); cursor: pointer; margin: 4px 4px 0 0; font-family: 'Sora';
            transition: 0.2s; font-size: 12px;
        }
        .eden-btn:hover { background: var(--primary); color: white; }

        /* Materialized Forms */
        .eden-form { background: #f9f9f9; padding: 15px; border-radius: 15px; margin-top: 10px; border: 1px solid #eee; }
        .eden-form input { width: 100%; padding: 8px; margin: 6px 0; border: 1px solid #ddd; border-radius: 8px; font-family: 'Sora'; box-sizing: border-box; }
        .eden-form button { width: 100%; padding: 10px; background: var(--secondary); color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 5px; font-weight: 600; }
    `;
    document.head.appendChild(styleSheet);

    // 4. Build UI
    const wrapper = document.createElement('div');
    wrapper.className = 'eden-chat-wrapper';
    wrapper.innerHTML = `
        <button class="eden-chat-toggle">💬</button>
        <div class="eden-chat-box">
            <div style="padding:20px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:10px;">
                <img src="${config.branding.logo}" style="width:30px; height:30px;">
                <div>
                    <div style="font-weight:700; font-size:16px;">${config.branding.name}</div>
                    <div style="font-size:11px; color:#888;">${config.branding.responseTimeText}</div>
                </div>
            </div>
            <div class="eden-messages" id="eden-ms"></div>
            <div style="padding:15px; border-top:1px solid #eee; display:flex; gap:10px;">
                <input type="text" id="eden-in" placeholder="Type a message..." style="flex:1; border:none; outline:none; font-family:'Sora';">
                <button id="eden-send" style="background:none; border:none; cursor:pointer; font-size:18px;">➤</button>
            </div>
        </div>
    `;
    document.body.appendChild(wrapper);

    const msgs = document.getElementById('eden-ms');
    const input = document.getElementById('eden-in');
    const box = wrapper.querySelector('.eden-chat-box');

    wrapper.querySelector('.eden-chat-toggle').onclick = () => box.classList.toggle('active');

    // 5. Messaging Engine
    async function apiCall(payload) {
        const res = await fetch(config.webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    }

    async function handleMsg(textOverride) {
        const val = textOverride || input.value.trim();
        if(!val) return;

        msgs.innerHTML += `<div class="eden-msg user">${val}</div>`;
        input.value = '';
        msgs.scrollTop = msgs.scrollHeight;

        const data = await apiCall({ chatInput: val });
        
        // Bot Text
        msgs.innerHTML += `<div class="eden-msg bot">${data.text}</div>`;

        // Materialize Buttons
        if(data.buttons) {
            const btnWrap = document.createElement('div');
            data.buttons.forEach(b => {
                const btn = document.createElement('button');
                btn.className = 'eden-btn';
                btn.innerText = b;
                btn.onclick = () => handleMsg(b);
                btnWrap.appendChild(btn);
            });
            msgs.appendChild(btnWrap);
        }

        // Materialize Forms
        if(data.form) {
            const fDiv = document.createElement('div');
            fDiv.className = 'eden-form';
            let html = `<div style="font-weight:600; margin-bottom:10px;">${data.form.title}</div>`;
            data.form.fields.forEach(f => {
                html += `<input type="${f.type || 'text'}" id="f-${f.name}" placeholder="${f.label}">`;
            });
            html += `<button id="f-sub">Submit</button>`;
            fDiv.innerHTML = html;
            fDiv.querySelector('#f-sub').onclick = () => {
                const results = {};
                data.form.fields.forEach(f => results[f.name] = fDiv.querySelector(`#f-${f.name}`).value);
                handleMsg(`Submitted: ${JSON.stringify(results)}`);
                fDiv.remove();
            };
            msgs.appendChild(fDiv);
        }
        msgs.scrollTop = msgs.scrollHeight;
    }

    document.getElementById('eden-send').onclick = () => handleMsg();
    input.onkeypress = (e) => { if(e.key === 'Enter') handleMsg(); };
    
    // Initial Welcome
    msgs.innerHTML += `<div class="eden-msg bot">${config.branding.welcomeText}</div>`;
})();