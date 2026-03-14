let tokens = JSON.parse(localStorage.getItem('tokens') || '[]');
let intervals = [];
let liveSecret = '';

function base32Decode(base32) {
    base32 = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (let i = 0; i < base32.length; i++) {
        const val = alphabet.indexOf(base32.charAt(i));
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    return new Uint8Array(bytes);
}

function generateTOTP(secret) {
    try {
        console.log('原始密钥:', secret);
        const key = base32Decode(secret);
        console.log('解码后长度:', key.length);
        if (key.length === 0) return '------';

        const epoch = Math.floor(Date.now() / 1000);
        let time = Math.floor(epoch / 30);
        const data = new Uint8Array(8);
        for (let i = 7; i >= 0; i--) {
            data[i] = time & 0xff;
            time >>= 8;
        }

        const shaObj = new jsSHA("SHA-1", "UINT8ARRAY");
        shaObj.setHMACKey(key, "UINT8ARRAY");
        shaObj.update(data);
        const hmac = shaObj.getHMAC("UINT8ARRAY");

        const offset = hmac[hmac.length - 1] & 0xf;
        const code = ((hmac[offset] & 0x7f) << 24) |
                     ((hmac[offset + 1] & 0xff) << 16) |
                     ((hmac[offset + 2] & 0xff) << 8) |
                     (hmac[offset + 3] & 0xff);

        const result = (code % 1000000).toString().padStart(6, '0');
        console.log('生成验证码:', result);
        return result;
    } catch (e) {
        console.error('生成失败:', e);
        return '------';
    }
}

function addToken() {
    const secret = document.getElementById('secretKey').value.trim().replace(/\s/g, '');
    if (!secret) return alert('Please enter a secret key');
    if (tokens.includes(secret)) return alert('This key already exists');
    tokens.push(secret);
    localStorage.setItem('tokens', JSON.stringify(tokens));
    document.getElementById('secretKey').value = '';
    liveSecret = '';
    renderTokens();
}

function onInputChange() {
    liveSecret = document.getElementById('secretKey').value.trim().replace(/\s/g, '');
    renderTokens();
}

function deleteToken(secret) {
    tokens = tokens.filter(t => t !== secret);
    localStorage.setItem('tokens', JSON.stringify(tokens));
    renderTokens();
}

function renderTokens() {
    intervals.forEach(clearInterval);
    intervals = [];
    const list = document.getElementById('tokenList');
    const allTokens = liveSecret && !tokens.includes(liveSecret) ? [liveSecret, ...tokens] : tokens;

    list.innerHTML = allTokens.map((secret, idx) => {
        const safeId = 'token-' + idx;
        return `
        <div class="token-item" data-secret="${secret}">
            ${idx === 0 && liveSecret && !tokens.includes(liveSecret) ? '' : `<button class="delete-btn" onclick="deleteToken('${secret}')">Delete</button>`}
            <div class="token-code" id="${safeId}-code" onclick="copyCode('${safeId}')">------</div>
            <div class="token-timer" id="${safeId}-timer">30s</div>
            <div class="progress-bar"><div class="progress-fill" id="${safeId}-progress"></div></div>
            <div class="token-secret">${secret}</div>
            <button class="copy-btn" id="${safeId}-copy" onclick="copyCode('${safeId}')">Copy</button>
        </div>
    `}).join('');

    allTokens.forEach((secret, idx) => {
        const safeId = 'token-' + idx;
        const update = () => {
            const code = generateTOTP(secret);
            const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
            document.getElementById(`${safeId}-code`).textContent = code;
            document.getElementById(`${safeId}-timer`).textContent = remaining + 's';
            document.getElementById(`${safeId}-progress`).style.width = (remaining / 30 * 100) + '%';
        };
        update();
        intervals.push(setInterval(update, 1000));
    });
}

function copyCode(safeId) {
    const el = document.getElementById(`${safeId}-code`);
    const btn = document.getElementById(`${safeId}-copy`);
    const code = el.textContent;
    navigator.clipboard.writeText(code).then(() => {
        el.style.color = '#4caf50';
        btn.textContent = 'Copied!';
        btn.style.background = '#4caf50';
        setTimeout(() => {
            el.style.color = '#667eea';
            btn.textContent = 'Copy';
            btn.style.background = '#667eea';
        }, 1000);
    });
}

const urlParams = new URLSearchParams(window.location.search);
const urlKey = urlParams.get('key');
if (urlKey) {
    const cleanKey = urlKey.trim().replace(/\s/g, '');
    if (!tokens.includes(cleanKey)) {
        tokens.push(cleanKey);
        localStorage.setItem('tokens', JSON.stringify(tokens));
    }
}

renderTokens();
