(function () {
    // 1. Load Font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap';
    document.head.appendChild(fontLink);

    // 2. Get Config from the Window object
    const config = window.ChatWidgetConfig || {
        webhook: { url: '' },
        branding: { logo: "https://www.shutterstock.com/image-vector/chat-bot-icon-virtual-smart-600nw-2478937553.jpg", name: 'Naten AI', welcomeText: 'Hello!', inputText: 'Type your message...' },
        style: { primaryColor: '#854fff' }
    };

    // 3. Inject Enhanced Styles (Glassmorphism + Sora)
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .naten-chat-wrapper {
            font-family: 'Sora', sans-serif;
            --primary: ${config.style.primaryColor};
            --secondary: ${config.style.secondaryColor || config.style.primaryColor};
        }
        .naten-chat-toggle {
            position: fixed; bottom: 32px; ${config.style.position}: 32px;
            width: 64px; height: 64px; border-radius: 50%;
            background: var(--primary); color: white; border: none; cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .naten-chat-toggle:hover{
            transform: scale(1.05); 
            filter: brightness(1.1); 
            transition: all 0.2s ease; 
        }
        .naten-chat-box {
            position: fixed; bottom: 110px; ${config.style.position}: 32px;
            width: 380px; height: 580px; border-radius: 24px;
            background: rgba(255, 255, 255, 1); backdrop-filter: blur(10px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.1); display: none;
            flex-direction: column; z-index: 9999; overflow: hidden;
            border: 1px solid rgba(255,255,255,0.5);
        }
        .naten-chat-box.active { display: flex; }
        .naten-send:hover
        {
            color: var(--primary);
            transform: translateX(3px); 
            transition: all 0.2s ease;
            cursor: pointer;
            }
        .naten-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .naten-msg { max-width: 80%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
        .naten-msg.user { background: var(--primary); color: white; align-self: flex-end; }
        .naten-msg.bot { background: white; color: #333; align-self: flex-start; border: 1px solid #eee; }
        
        /* Materialized Buttons */
        .naten-btn { 
            padding: 8px 12px; border-radius: 20px; border: 1px solid var(--primary);
            background: white; color: var(--primary); cursor: pointer; margin: 4px 4px 0 0; font-family: 'Sora';
            transition: 0.2s; font-size: 12px;
        }
        .naten-btn:hover { background: var(--primary); color: white; }

        /* Materialized Forms */
        .naten-form { background: #f9f9f9; padding: 15px; border-radius: 15px; margin-top: 10px; border: 1px solid #eee; }
        .naten-form input { width: 100%; padding: 8px; margin: 6px 0; border: 1px solid #ddd; border-radius: 8px; font-family: 'Sora'; box-sizing: border-box; }
        .naten-form button { width: 100%; padding: 10px; background: var(--secondary); color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 5px; font-weight: 600; }
        /* Disclaimer Notification Badge */
        .naten-disclaimer {
            background: #f8f9fa;
            color: #727272;
            font-size: 11px;
            padding: 12px 16px;
            margin: -20px -20px 15px -20px; /* Aligns to the top edges of the message box */
            text-align: center;
            border-bottom: 1px solid #ededed;
            line-height: 1.4;
            position: sticky;
            top: -20px; /* Keeps it visible even as they start scrolling */
            z-index: 10;
        }

        .naten-disclaimer strong {
            color: #333;
            display: block;
            margin-bottom: 2px;
        }

        .bg{
        background-color:#fff;
        background-image:linear-gradient(135deg, transparent 0%, #fff 25%, #fff 75%, transparent 100%), url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAIklEQVQoU2N89+7dfwYsQEhIiBEkzDgkFGDzAbIY2Cv4AACvrBgJjYNGfwAAAABJRU5ErkJggg==);
        
        }
        `;
    document.head.appendChild(styleSheet);

    // 4. Build UI
    const wrapper = document.createElement('div');
    wrapper.className = 'naten-chat-wrapper';
    wrapper.innerHTML = `
        <button class="naten-chat-toggle">
            <svg  width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" fill="#ffffff"></path> </g></svg></button>
        <div class="naten-chat-box bg">
            <div style="padding:20px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:10px;">
                <img src="${config.branding.logo}" style="width:30px; height:30px;">
                <div>
                    <div style="font-weight:700; font-size:16px;">${config.branding.name}</div>
                    <div style="font-size:11px; color:#888;">${config.branding.responseTimeText}</div>
                </div>
            </div>
            <div class="naten-messages" id="naten-ms"></div>
            <div style="padding:15px; border-top:1px solid #eee; display:flex; gap:10px;">
                <input type="text" id="naten-in" placeholder="${config.branding.inputText}" style="flex:1; border:none; outline:none; font-family:'Sora';">
                <button id="naten-send" style="background:none; border:none; cursor:pointer; font-size:18px;">
                <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></button>
            </div>
        </div>
    `;
    document.body.appendChild(wrapper);

    const msgs = document.getElementById('naten-ms');
    const input = document.getElementById('naten-in');
    const box = wrapper.querySelector('.naten-chat-box');

    wrapper.querySelector('.naten-chat-toggle').onclick = () => box.classList.toggle('active');

    // 5. Messaging Engine
    async function apiCall(payload) {
        const res = await fetch(config.webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    }

    async function handleSendMessage(displayOverride, hiddenData = null) {
        const val = displayOverride || input.value.trim();
        if (!val) return;

        // Show the pretty version (Bullet points) in the UI
        msgs.innerHTML += `<div class="naten-msg user" style="white-space: pre-wrap;">${val}</div>`;
        input.value = '';
        msgs.scrollTop = msgs.scrollHeight;

        // Send the actual data (JSON) to n8n
        const payload = hiddenData ? { formResponse: hiddenData } : { chatInput: val };
        const data = await apiCall(payload);

        // Bot Text
        msgs.innerHTML += `<div class="naten-msg bot">${data.text}</div>`;

        // Materialize Buttons
        if (data.buttons) {
            const btnWrap = document.createElement('div');
            data.buttons.forEach(b => {
                const btn = document.createElement('button');
                btn.className = 'naten-btn';
                btn.innerText = b;
                btn.onclick = () => handleSendMessage(b);
                btnWrap.appendChild(btn);
            });
            msgs.appendChild(btnWrap);
        }

        // 5. SMART MATERIALIZE FORM
        if (data.form) {
            const fDiv = document.createElement('div');
            fDiv.className = 'naten-form';
            let html = `<div style="font-weight:600; margin-bottom:10px;">${data.form.title}</div>`;

            data.form.fields.forEach(f => {
                html += `
            <div style="margin-bottom:8px;">
                <label style="font-size:11px; color:#666;">${f.label}</label>
                <input type="${f.type || 'text'}" 
                       id="f-${f.name}" 
                       class="form-input" 
                       placeholder="${f.label}"
                       ${f.type === 'number' ? 'step="any" inputmode="decimal"' : ''}>
            </div>`;
            });

            html += `<button id="f-sub" class="form-submit">Submit</button>`;
            fDiv.innerHTML = html;

            // Strict Number Validation Logic
            const inputs = fDiv.querySelectorAll('input');
            const subBtn = fDiv.querySelector('#f-sub');

            fDiv.querySelector('#f-sub').onclick = () => {
                const results = {};
                let displayText = `**${data.form.title} Details:**\n`; // Header for the bubble

                data.form.fields.forEach(f => {
                    const val = fDiv.querySelector(`#f-${f.name}`).value;
                    results[f.name] = val;
                    displayText += `• **${f.label}:** ${val}\n`; // Formats as bullet points
                });

                // 1. Send the HIDDEN JSON to n8n for processing
                // 2. But show the BEAUTIFUL Bullet points in the chat UI
                handleSendMessage(displayText, results);
                fDiv.remove();
            };
            msgs.appendChild(fDiv);
        }
    }

    function materializeInitialOptions() {

        // 1. Clear container first to prevent double-loading
        msgs.innerHTML = '';

        // 2. Add the Disclaimer Notification Badge
        // It pulls text from config.branding.disclaimer
        const disclaimerText = config.branding.disclaimer || "Notis: Perbualan ini mungkin dirakam untuk tujuan kualiti.";
        const disclaimerDiv = document.createElement('div');
        disclaimerDiv.className = 'naten-disclaimer';
        disclaimerDiv.innerHTML = `<strong>Sistem Notis</strong> ${disclaimerText}`;
        msgs.appendChild(disclaimerDiv);

        // 3. Get the welcome text from config
        const welcomeText = config.branding.welcomeText || "How can we help?";
        msgs.innerHTML += `<div class="naten-msg bot">${welcomeText}</div>`;

        // 4. Look for buttons in the config
        const initialButtons = config.branding.initialButtons;

        if (initialButtons && Array.isArray(initialButtons)) {
            const btnWrap = document.createElement('div');
            btnWrap.style.marginTop = '10px';
            btnWrap.style.display = 'flex';
            btnWrap.style.flexWrap = 'wrap';
            btnWrap.style.gap = '8px';
            // Align buttons based on widget position
            btnWrap.style.justifyContent = config.style.position === 'right' ? 'flex-end' : 'flex-start';

            initialButtons.forEach(buttonLabel => {
                const btn = document.createElement('button');
                btn.className = 'naten-btn'; // Fixed class name
                btn.innerText = buttonLabel;

                // Use the correct function name: handleSendMessage
                btn.onclick = () => handleSendMessage(buttonLabel);

                btnWrap.appendChild(btn);
            });

            msgs.appendChild(btnWrap);
        }
        msgs.scrollTop = msgs.scrollHeight;
    }

    // Call the function
    materializeInitialOptions();

    document.getElementById('naten-send').onclick = () => handleSendMessage();
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSendMessage(); };

})();