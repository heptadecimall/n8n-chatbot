(function () {
    // 1. Load Font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap';
    document.head.appendChild(fontLink);

    // 2. Get Config from the Window object
    const config = window.ChatWidgetConfig || {
        webhook: { url: '' },
        branding: { logo: "https://www.shutterstock.com/image-vector/chat-bot-icon-virtual-smart-600nw-2478937553.jpg", names: 'Naten AI, Nath AI', welcomeText: 'Hello!', inputText: 'Type your message...' },
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
            transition: all 0.2s ease; 
        }
        .naten-chat-toggle:hover{
            transform: scale(1.05); 
            filter: brightness(1.1); 
        }
        .naten-chat-box {
            position: fixed; bottom: 110px; ${config.style.position}: 32px;
            width: 380px; height: 580px; border-radius: 24px;
            background: rgba(255, 255, 255, 1); backdrop-filter: blur(10px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.1); display: none;
            flex-direction: column; z-index: 9999; overflow: hidden;
            border: 1px solid #d1d5db; 
        }
        .naten-chat-box.active { display: flex; }
        
        #naten-send {
            background: none; border: none; cursor: pointer; font-size: 18px;
            transition: all 0.2s ease;
            display: flex; align-items: center; justify-content: center;
        }
        #naten-send:hover {
            color: var(--primary);
            transform: translateX(3px); 
        }
        
        .naten-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .naten-msg { max-width: 80%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
        .naten-msg.user { background: var(--primary); color: white; align-self: flex-end; }
        .naten-msg.bot { background: white; color: #333; align-self: flex-start; border: 1px solid #eee; }
        
        /* Materialized Option Button Wrapper */
        .naten-btn-wrapper {
            display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;
            justify-content: flex-start; 
        }
        .naten-btn { 
            padding: 8px 12px; border-radius: 20px; border: 1px solid var(--primary);
            background: white; color: var(--primary); cursor: pointer; font-family: 'Sora';
            transition: 0.2s; font-size: 12px;
        }
        .naten-btn:hover { background: var(--primary); color: white; }

        /* --- White Background Form Container --- */
        .naten-form { 
            background: #ffffff; 
            padding: 15px; 
            border-radius: 15px; 
            margin-top: 10px; 
            border: 1px solid #eee; 
            align-self: flex-start; 
            width: 85%; 
            box-sizing: border-box;
            box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px;
        }
        .naten-form input { width: 100%; padding: 8px; margin: 6px 0; border: 1px solid #ddd; border-radius: 8px; font-family: 'Sora'; box-sizing: border-box; }
        .naten-form button { width: 100%; padding: 10px; background: var(--secondary); color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 5px; font-weight: 600; }
        
        /* --- Hide Arrow Buttons on Number Inputs --- */
        .naten-form input[type="number"]::-webkit-outer-spin-button,
        .naten-form input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .naten-form input[type="number"] {
            -moz-appearance: textfield;
        }
        
        /* Disclaimer Notification Badge */
        .naten-disclaimer {
            background: #fffbeb; 
            color: #92400e; 
            font-size: 12px;
            padding: 14px 16px;
            margin: -5px 0 10px 0;
            border-radius: 16px; 
            border: 1px solid #fef3c7; 
            outline: 1px solid #f59e0b; 
            line-height: 1.5;
            text-align: left;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .naten-disclaimer strong { 
            color: #78350f; 
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .bg {
            background-color:#fff;
            background-image:linear-gradient(135deg, transparent 0%, #fff 25%, #fff 75%, transparent 100%), url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAIklEQVQoU2N89+7dfwYsQEhIiBEkzDgkFGDzAbIY2Cv4AACvrBgJjYNGfwAAAABJRU5ErkJggg==);
        }
    `;
    document.head.appendChild(styleSheet);

    const nameArray = config.branding.names.split(',').map(item => item.trim());
    const randomIndex = Math.floor(Math.random() * nameArray.length);
    const finalName = nameArray[randomIndex];

    // 4. Build UI
    const wrapper = document.createElement('div');
    wrapper.className = 'naten-chat-wrapper';
    wrapper.innerHTML = `
        <button class="naten-chat-toggle">
            <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" fill="#ffffff"></path> </g></svg></button>
        <div class="naten-chat-box bg">
            <div style="padding:20px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:10px; background-color:#fff; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06); z-index: 10; position: relative;">
                <img src="${config.branding.logo}" style="width:30px; height:30px; border-radius:50%;">
                <div>
                    <div style="font-weight:700; font-size:16px;">${finalName}</div>
                    <div style="font-size:11px; color:#888;">${config.branding.responseTimeText || 'Online'}</div>
                </div>
            </div>
            <div class="naten-messages bg" id="naten-ms"></div>
            <div style="padding:15px; border-top:1px solid #eee; display:flex; gap:10px; background-color:#fff; box-shadow: 0 -4px 14px rgba(0, 0, 0, 0.04); z-index: 10; position: relative;">
                <input type="text" id="naten-in" placeholder="${config.branding.inputText}" style="flex:1; border:none; outline:none; font-family:'Sora';">
                <button id="naten-send">
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

        msgs.innerHTML += `<div class="naten-msg user" style="white-space: pre-wrap;">${val}</div>`;
        input.value = '';
        msgs.scrollTop = msgs.scrollHeight;

        const payload = hiddenData ? { formResponse: hiddenData } : { chatInput: val };
        const data = await apiCall(payload);

        msgs.innerHTML += `<div class="naten-msg bot">${data.text}</div>`;

        if (data.buttons) {
            const btnWrap = document.createElement('div');
            btnWrap.className = 'naten-btn-wrapper';

            data.buttons.forEach(b => {
                const btn = document.createElement('button');
                btn.className = 'naten-btn';
                btn.innerText = b;
                btn.onclick = () => {
                    btnWrap.remove();
                    handleSendMessage(b);
                };
                btnWrap.appendChild(btn);
            });
            msgs.appendChild(btnWrap);
        }

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

            fDiv.querySelector('#f-sub').onclick = () => {
                const results = {};
                let displayText = `**${data.form.title} Details:**\n`;

                data.form.fields.forEach(f => {
                    const val = fDiv.querySelector(`#f-${f.name}`).value;
                    results[f.name] = val;
                    displayText += `• **${f.label}:** ${val}\n`;
                });

                fDiv.remove();
                handleSendMessage(displayText, results);
            };
            msgs.appendChild(fDiv);
        }
        msgs.scrollTop = msgs.scrollHeight;
    }

    function materializeInitialOptions() {
        msgs.innerHTML = '';

        const disclaimerText = config.branding.disclaimer || "Notis: Perbualan ini mungkin dirakam untuk tujuan kualiti.";
        const disclaimerDiv = document.createElement('div');
        disclaimerDiv.className = 'naten-disclaimer';
        disclaimerDiv.innerHTML = `<strong>⚠️ Nota</strong><span>${disclaimerText}</span>`;
        msgs.appendChild(disclaimerDiv);

        const welcomeText = config.branding.welcomeText || "How can we help?";
        msgs.innerHTML += `<div class="naten-msg bot">${welcomeText}</div>`;

        const initialButtons = config.branding.initialButtons;

        if (initialButtons && Array.isArray(initialButtons)) {
            const btnWrap = document.createElement('div');
            btnWrap.className = 'naten-btn-wrapper';

            initialButtons.forEach(buttonLabel => {
                const btn = document.createElement('button');
                btn.className = 'naten-btn';
                btn.innerText = buttonLabel;

                btn.onclick = () => {
                    btnWrap.remove();
                    handleSendMessage(buttonLabel);
                };

                btnWrap.appendChild(btn);
            });

            msgs.appendChild(btnWrap);
        }
        msgs.scrollTop = msgs.scrollHeight;
    }

    materializeInitialOptions();

    document.getElementById('naten-send').onclick = () => handleSendMessage();
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSendMessage(); };

})();