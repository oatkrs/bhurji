async function scramble(input, func = 'SHA-256') {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await window.crypto.subtle.digest(func, data);
    return new Uint8Array(hash);
}

function convertToCharset(password, specialchars) {
    let result = '';
    for (let i = 0; i < password.length; i++) {
        let c = password[i];
        if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122)) {
            result += String.fromCharCode(c);
        } else {
            result += specialchars[i % specialchars.length];
        }
    }
    return result;
}

document.getElementById('password-form').addEventListener('submit', async function(event) {
    event.preventDefault();


    document.getElementById('password-form').querySelector('input[type="submit"]').disabled = true;

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    const file = document.getElementById('file').files[0];
    const showPassword = document.getElementById('show-password').checked;
    const copyToClipboard = document.getElementById('copy-to-clipboard').checked;


    let fileData = await file.arrayBuffer();

    let key = await scramble(password);
    let vec = await scramble(login);

    const aesOut1 = await scramble(new TextDecoder().decode(new Uint8Array(fileData)) + new TextDecoder().decode(key));

    const shaDigest = await scramble(new TextDecoder().decode(aesOut1), 'SHA-512');
    const key2 = shaDigest.slice(0, 32);

    const aesOut2 = await scramble(new TextDecoder().decode(new Uint8Array(aesOut1)) + new TextDecoder().decode(key2));

    const start = key[0] % aesOut2.length;
    const portion = aesOut2.slice(start);
    let result = portion;

    for (let i = 0; i < 1; i++) {
        result = await scramble(new TextDecoder().decode(result), 'SHA-512');
    }

    let longpass = btoa(String.fromCharCode.apply(null, new Uint8Array(result)));
    longpass = longpass.substring(0, 30);
    longpass = convertToCharset(new Uint8Array(longpass.length).map((_, i) => longpass.charCodeAt(i)), '_&#');

    if (showPassword) {
        document.getElementById('result').textContent = longpass;
        if (copyToClipboard) {
            navigator.clipboard.writeText(longpass);
        }
    } else {
        navigator.clipboard.writeText(longpass);
        document.getElementById('result').textContent = 'Password copied to clipboard.';
    }

    document.getElementById('password-form').querySelector('input[type="submit"]').disabled = false;

});
document.getElementById('dark-mode-toggle').addEventListener('click', function() {
    var imgElement = this.children[0]; // Get the img element inside the button
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        imgElement.src = 'light.png';
    } else {
        imgElement.src = 'dark.png';
    }
});
window.onload = function() {
    var container = document.getElementById('clouds-container');
    for (var i = 0; i < 15; i++) { // Create 15 clouds to ensure at least 5 are in view at a time
        var cloud = document.createElement('img');
        cloud.src = 'cloud.png';
        cloud.className = 'cloud';
        cloud.style.width = (Math.random() * 10 + 5) + 'vw'; // Random size between 5vw and 15vw
        cloud.style.left = (Math.random() * 200 - 100) + 'vw'; // Random starting position between -100vw and 100vw
        cloud.style.animationDuration = (Math.random() * 5 + 5) + 's'; // Random speed between 5 and 10 seconds
        container.appendChild(cloud);
    }
};