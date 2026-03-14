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
    const cleanUrl = `${url.pathname}${search ? `?${search}` : ''}${url.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
}

function normalizeSecret(value) {
    return value.trim().toUpperCase().replace(/\s/g, '');
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

function addToken() {
    const secret = getInputSecret();
    if (!isValidSecret(secret)) {
        alert('Please enter a valid Base32 secret key');
        return;
    }

    if (tokens.includes(secret)) {
        alert('This key already exists');
        return;
    }

    tokens.push(secret);
    document.getElementById('secretKey').value = '';
    liveSecret = '';
    renderTokens();
}

function onInputChange() {
    const secret = getInputSecret();
    liveSecret = isValidSecret(secret) ? secret : '';
    renderTokens();
}

function deleteToken(secret) {
    tokens = tokens.filter((token) => token !== secret);
    renderTokens();
}

function createTokenItem(secret, safeId, showDeleteButton) {
    const item = document.createElement('div');
    item.className = 'token-item';
    item.dataset.secret = secret;

    if (showDeleteButton) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteToken(secret));
        item.appendChild(deleteButton);
    }

    const code = document.createElement('div');
    code.className = 'token-code';
    code.id = `${safeId}-code`;
    code.textContent = '------';
    code.addEventListener('click', () => copyCode(safeId));
    item.appendChild(code);

    const timer = document.createElement('div');
    timer.className = 'token-timer';
    timer.id = `${safeId}-timer`;
    timer.textContent = '30s';
    item.appendChild(timer);

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.id = `${safeId}-progress`;
    progressBar.appendChild(progressFill);
    item.appendChild(progressBar);

    const secretText = document.createElement('div');
    secretText.className = 'token-secret';
    secretText.textContent = secret;
    item.appendChild(secretText);

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';
    copyButton.id = `${safeId}-copy`;
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

    const showPreview = liveSecret && !tokens.includes(liveSecret);
    const allTokens = showPreview ? [liveSecret, ...tokens] : [...tokens];

    allTokens.forEach((secret, idx) => {
        const safeId = `token-${idx}`;
        const elements = createTokenItem(secret, safeId, !(showPreview && idx === 0));
        list.appendChild(elements.item);

        const update = () => {
            const code = generateTOTP(secret);
            const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
            elements.code.textContent = code;
            elements.timer.textContent = `${remaining}s`;
            elements.progressFill.style.width = `${(remaining / 30) * 100}%`;
        };

        update();
        intervals.push(setInterval(update, 1000));
    });
}

function copyCode(safeId) {
    const codeElement = document.getElementById(`${safeId}-code`);
    const button = document.getElementById(`${safeId}-copy`);
    const code = codeElement?.textContent ?? '';

    if (!code || code === '------' || !navigator.clipboard) {
        return;
    }

    navigator.clipboard.writeText(code).then(() => {
        codeElement.style.color = '#4caf50';
        button.textContent = 'Copied!';
        button.style.background = '#4caf50';

        setTimeout(() => {
            codeElement.style.color = '#667eea';
            button.textContent = 'Copy';
            button.style.background = '#667eea';
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
