"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const jwt = __importStar(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const app = (0, express_1.default)();
const swaggerDoc = yamljs_1.default.load('swagger-spec-test.yml');
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDoc));
app.use(express_1.default.text());
app.use(body_parser_1.default.json({ limit: "30mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "30mb", extended: true }));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const SECRET_KEY = crypto_1.default.randomBytes(64).toString('hex');
// Check if the server works properly
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
// Endpoint pour obtenir un token
app.post('/api/token', (req, res) => {
    const { emailUser } = req.body;
    if (!emailUser) {
        return res.status(400).json({ error: "Email obligatoire!" });
    }
    const token = jwt.sign({ emailUser }, SECRET_KEY, { expiresIn: '24h' });
    res.status(200).json({ email: emailUser, tokenID: token });
});
function allSpacesPositions(text) {
    let tab = [];
    for (let i = 0; i < text.length; i++) {
        if (text.charAt(i) === ' ') {
            tab.push(i);
        }
    }
    return tab;
}
function justifyText(text, maxCharsPerLine) {
    const arrayText = text.split(' ');
    let temp = '';
    let tab = [];
    let newText = '';
    for (let word of arrayText) {
        if (temp.length + word.length <= maxCharsPerLine) {
            temp += word + ' ';
        }
        else {
            tab.push(temp.trim());
            temp = '';
            temp += word + ' ';
        }
    }
    tab.push(temp.trim());
    for (let text of tab) {
        if (maxCharsPerLine - text.length !== 0) {
            let extraSpacesCount = ' '.repeat(maxCharsPerLine - text.length).length;
            while (extraSpacesCount > 0) {
                const spacePositions = allSpacesPositions(text);
                const idx = Math.floor(Math.random() * spacePositions.length);
                const randomSpaceIndex = spacePositions[idx];
                text = text.slice(0, randomSpaceIndex) + ' ' + text.slice(randomSpaceIndex);
                extraSpacesCount--;
            }
            newText += (text + '\n');
        }
        else {
            newText += (text + '\n');
        }
    }
    return newText;
}
// Objet pour stocker le quota quotidien par token
const quotaQuotidien = new Map();
// Middleware pour vérifier le taux limite de mots par token
const checkRateLimitMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    const textToJustify = req.body;
    if (token) {
        // On compte le nombre de mots du texte à justifier
        const wordsLength = textToJustify.length;
        // On vérifie si pour le token, il y a déjà eu un nombre de mots utilisés
        if (quotaQuotidien.has(token)) {
            const usedWordsLength = quotaQuotidien.get(token) || 0;
            // On vérifie si le nombre de mots courant du token + le nombre de mots de la requête est supérieure à 80000
            const rateLimit = usedWordsLength + wordsLength;
            if (rateLimit > 80000) {
                // Si la somme dépasse, on renvoie une erreur 402 Payment required
                res.status(402).json({ error: 'Payment Required' });
            }
            else {
                // Sinon on ajoute le nombre de mots utilisés lors de la requête au nombre de mots courant du token
                quotaQuotidien.set(token, rateLimit);
                next();
            }
        }
        else {
            quotaQuotidien.set(token, wordsLength);
            next();
        }
    }
    else {
        res.status(401).json({ error: 'Échec: Token requis' });
        return;
    }
};
// Endpoint pour justifier le texte
app.post('/api/justify', checkRateLimitMiddleware, (req, res) => {
    const textToJustify = req.body;
    const wordsLength = textToJustify.length;
    if (wordsLength > 80000) {
        res.status(402).json({ error: 'Payment Required' });
    }
    else {
        const justifiedText = justifyText(textToJustify, 80);
        console.log(justifiedText);
        res.json({ justifiedText, currentRate: wordsLength });
    }
});
const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
exports.default = app;
