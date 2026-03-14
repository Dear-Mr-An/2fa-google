const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2FA Authenticator</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M128 128c170.665 0 298.665-42.665 384-128 85.335 85.335 213.335 128 384 128v512c0 128-128 256-384 384-256-128-384-256-384-384V128z' fill='%2325A850'/%3E%3Cpath d='M704.113 316.124l63.774 71.752-321.822 286.07-160.005-160 67.88-67.892 96 96z' fill='%23FFFFFF'/%3E%3C/svg%3E">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }
        body::before {
            content: '';
            position: absolute;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            top: -250px;
            right: -250px;
            border-radius: 50%;
        }
        body::after {
            content: '';
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
            bottom: -200px;
            left: -200px;
            border-radius: 50%;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
        }
        h1 {
            text-align: center;
            color: white;
            margin-bottom: 30px;
            font-size: 28px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        input {
            flex: 1;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            font-size: 16px;
            color: white;
            transition: all 0.3s;
        }
        input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }
        input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
        }
        button {
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
        }
        button:hover {
            background: rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        .token-item {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 15px;
            position: relative;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        .token-code {
            font-size: 36px;
            font-weight: bold;
            color: white;
            text-align: center;
            letter-spacing: 8px;
            margin: 10px 0;
            cursor: pointer;
            user-select: none;
            transition: all 0.3s;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .token-code:hover {
            transform: scale(1.05);
            text-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
        }
        .token-timer {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
        }
        .progress-bar {
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            margin-top: 10px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: rgba(255, 255, 255, 0.6);
            transition: width 1s linear;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        .token-secret {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            text-align: center;
            margin-top: 10px;
            margin-bottom: 10px;
            word-break: break-all;
        }
        .copy-btn {
            width: 100%;
            margin-top: 5px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s;
        }
        .copy-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>2FA Authenticator</h1>
        <div class="input-group">
            <input type="text" id="secretKey" placeholder="Enter Secret Key" autocomplete="off" spellcheck="false">
        </div>
        <div id="tokenList"></div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsSHA/3.3.1/sha1.min.js"></script>
    <script>
let tokens = [];
let intervals = [];
let liveSecret = '';

const STORAGE_KEY = 'tokens';
const SECRET_PATTERN = /^[A-Z2-7]+$/;
const MAX_SECRET_LENGTH = 128;

function clearLegacyStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        return;
    }
}

function stripSecretFromUrl() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('key')) {
        return;
    }

    url.searchParams.delete('key');
    const search = url.searchParams.toString();
    const cleanUrl = \`\${url.pathname}\${search ? \`?\${search}\` : ''}\${url.hash}\`;
    window.history.replaceState({}, document.title, cleanUrl);
}

function normalizeSecret(value) {
    return value.trim().toUpperCase().replace(/\\s/g, '');
}

function isValidSecret(secret) {
    return secret.length > 0 && secret.length <= MAX_SECRET_LENGTH && SECRET_PATTERN.test(secret);
}

function getInputSecret() {
    const input = document.getElementById('secretKey');
    return normalizeSecret(input.value);
}

function base32Decode(base32) {
    const normalized = normalizeSecret(base32).replace(/[^A-Z2-7]/g, '');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';

    for (let i = 0; i < normalized.length; i++) {
        const value = alphabet.indexOf(normalized.charAt(i));
        if (value === -1) {
            continue;
        }

        bits += value.toString(2).padStart(5, '0');
    }

    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }

    return new Uint8Array(bytes);
}

function generateTOTP(secret) {
    try {
        const key = base32Decode(secret);
        if (key.length === 0 || typeof jsSHA !== 'function') {
            return '------';
        }

        const epoch = Math.floor(Date.now() / 1000);
        let time = Math.floor(epoch / 30);
        const data = new Uint8Array(8);

        for (let i = 7; i >= 0; i--) {
            data[i] = time & 0xff;
            time >>= 8;
        }

        const shaObj = new jsSHA('SHA-1', 'UINT8ARRAY');
        shaObj.setHMACKey(key, 'UINT8ARRAY');
        shaObj.update(data);
        const hmac = shaObj.getHMAC('UINT8ARRAY');

        const offset = hmac[hmac.length - 1] & 0xf;
        const code = ((hmac[offset] & 0x7f) << 24)
            | ((hmac[offset + 1] & 0xff) << 16)
            | ((hmac[offset + 2] & 0xff) << 8)
            | (hmac[offset + 3] & 0xff);

        return (code % 1000000).toString().padStart(6, '0');
    } catch (error) {
        return '------';
    }
}

function onInputChange() {
    const secret = getInputSecret();
    liveSecret = isValidSecret(secret) ? secret : '';
    renderTokens();
}

function createTokenItem(secret, safeId) {
    const item = document.createElement('div');
    item.className = 'token-item';
    item.dataset.secret = secret;

    const code = document.createElement('div');
    code.className = 'token-code';
    code.id = \`\${safeId}-code\`;
    code.textContent = '------';
    code.addEventListener('click', () => copyCode(safeId));
    item.appendChild(code);

    const timer = document.createElement('div');
    timer.className = 'token-timer';
    timer.id = \`\${safeId}-timer\`;
    timer.textContent = '30s';
    item.appendChild(timer);

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.id = \`\${safeId}-progress\`;
    progressBar.appendChild(progressFill);
    item.appendChild(progressBar);

    const secretText = document.createElement('div');
    secretText.className = 'token-secret';
    secretText.textContent = secret;
    item.appendChild(secretText);

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';
    copyButton.id = \`\${safeId}-copy\`;
    copyButton.textContent = 'Copy';
    copyButton.addEventListener('click', () => copyCode(safeId));
    item.appendChild(copyButton);

    return { item, code, timer, progressFill, copyButton };
}

function renderTokens() {
    intervals.forEach((intervalId) => clearInterval(intervalId));
    intervals = [];

    const list = document.getElementById('tokenList');
    list.replaceChildren();

    if (!liveSecret) return;

    const safeId = 'token-0';
    const elements = createTokenItem(liveSecret, safeId);
    list.appendChild(elements.item);

    const update = () => {
        const code = generateTOTP(liveSecret);
        const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
        elements.code.textContent = code;
        elements.timer.textContent = \`\${remaining}s\`;
        elements.progressFill.style.width = \`\${(remaining / 30) * 100}%\`;
    };

    update();
    intervals.push(setInterval(update, 1000));
}

function copyCode(safeId) {
    const codeElement = document.getElementById(\`\${safeId}-code\`);
    const button = document.getElementById(\`\${safeId}-copy\`);
    const code = codeElement?.textContent ?? '';

    if (!code || code === '------' || !navigator.clipboard) {
        return;
    }

    navigator.clipboard.writeText(code).then(() => {
        codeElement.style.color = '#4caf50';
        button.textContent = 'Copied!';
        button.style.background = '#4caf50';

        setTimeout(() => {
            codeElement.style.color = 'white';
            button.textContent = 'Copy';
            button.style.background = 'rgba(255, 255, 255, 0.2)';
        }, 1000);
    }).catch(() => {
        return;
    });
}

function init() {
    clearLegacyStorage();

    const urlParams = new URLSearchParams(window.location.search);
    const urlKey = urlParams.get('key');
    if (urlKey) {
        const cleanKey = normalizeSecret(urlKey);
        if (isValidSecret(cleanKey)) {
            liveSecret = cleanKey;
            document.getElementById('secretKey').value = cleanKey;
        }
    }

    stripSecretFromUrl();
    document.getElementById('secretKey').addEventListener('input', onInputChange);
    renderTokens();
}

init();
    </script>
</body>
</html>`;

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 路径参数重定向
        if (path.length > 1 && !path.includes('.') && path !== '/favicon.ico') {
            const key = path.slice(1);
            return Response.redirect(`${url.origin}/?key=${key}`, 302);
        }

        // 返回 HTML
        return new Response(HTML, {
            headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
    }
};
