/* =========================
   FIXED TABLE
========================= */
export const baseSingles = { A: 1, E: 2, I: 3, O: 4, T: 5 };
export const altSingles = { A: 7, E: 8, I: 9 };
export const doubles = {
    B: 60, C: 61, D: 62, F: 63, G: 64, H: 65, J: 66,
    K: 67, L: 68, Y: 69, Z: 70,
    M: 71, N: 72, P: 73, Q: 74, R: 75, S: 76,
    U: 77, V: 78, W: 79, X: 80
};

export const codeToLetter = {};
Object.entries(baseSingles).forEach(([k, v]) => codeToLetter[v] = k);
Object.entries(altSingles).forEach(([k, v]) => codeToLetter[v] = k);
Object.entries(doubles).forEach(([k, v]) => codeToLetter[v] = k);

/* =========================
   PRESETS
========================= */
export const PRESETS = {
    default: { keyword: "KEY", mask: "5" },
    preset1: { keyword: "NOVA", mask: "37" },
    preset2: { keyword: "AURORA", mask: "904" }
};

/* =========================
   HELPERS (PURE)
========================= */
export function cleanPlaintext(s) {
    return (s || "")
        .toUpperCase()
        .replace(/[^A-Z ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function keywordToValues(k) {
    const key = (k || "").toUpperCase().replace(/[^A-Z]/g, "");
    return key ? [...key].map(ch => ch.charCodeAt(0) - 65) : [0];
}

export function maskToDigits(m) {
    const s = (m || "").replace(/[^0-9]/g, "");
    return s ? [...s].map(d => Number(d)) : [0];
}

export function pad2(n) {
    return String(((n % 100) + 100) % 100).padStart(2, "0");
}

export function parseCipherTokens(s) {
    if (!s) return [];
    if (s.includes(" "))
        return s.split(/\s+/).map(Number).filter(n => !isNaN(n));

    const only = s.replace(/\D/g, "");
    return only.match(/.{1,2}/g)?.map(Number) || [];
}

/* =========================
   ENCRYPT (PURE)
========================= */
export function encryptHybridWithTrace(plainText, key, msk) {
    const cleaned = cleanPlaintext(plainText);
    const letters = cleaned.replace(/ /g, "");

    const keyVals = keywordToValues(key);
    const maskDigits = maskToDigits(msk);

    const tokens = [];

    [...letters].forEach((ch, i) => {
        let base =
            baseSingles[ch] ??
            doubles[ch] ??
            doubles.X;

        if ((ch === "A" || ch === "E" || ch === "I") && i % 2 === 0) {
            base = altSingles[ch];
        }
        tokens.push(base);
    });

    while (tokens.length % 3 !== 0) tokens.push(doubles.X);

    const out = [];
    const trace = [];

    for (let i = 0; i < tokens.length; i += 3) {
        const bi = i / 3;
        const [a, b, c] = tokens.slice(i, i + 3);

        const mixed = [
            a,
            (a + b) % 100,
            (b + c) % 100
        ];

        const shifted = mixed.map(
            (v, j) => (v + (keyVals[j % keyVals.length] || 0) + bi) % 100
        );

        const md = maskDigits[bi % maskDigits.length];
        const masked = shifted.map(v => (v + md) % 100);

        out.push(...masked);
        trace.push({ block: [a, b, c], mixed, shifted, masked });
    }

    return {
        cipherTokens: out,
        cipherText: out.map(pad2).join(" "),
        trace
    };
}

/* =========================
   DECRYPT (PURE)
========================= */
export function decryptHybridWithTrace(cipherText, key, msk) {
    const tokens = parseCipherTokens(cipherText);
    const keyVals = keywordToValues(key);
    const maskDigits = maskToDigits(msk);

    const recovered = [];

    for (let i = 0; i < tokens.length; i += 3) {
        const bi = i / 3;
        const block = tokens.slice(i, i + 3);

        const md = maskDigits[bi % maskDigits.length];
        const unmasked = block.map(v => (v - md + 100) % 100);

        const unshifted = unmasked.map(
            (v, j) => (v - (keyVals[j % keyVals.length] || 0) - bi + 200) % 100
        );

        const a = unshifted[0];
        const b = (unshifted[1] - a + 100) % 100;
        const c = (unshifted[2] - b + 100) % 100;

        recovered.push(a, b, c);
    }

    let plain = recovered.map(t => codeToLetter[t] || "").join("");
    plain = plain.replace(/X+$/, "");

    return { plain };
}
