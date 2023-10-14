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
const jwt = __importStar(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
dotenv_1.default.config();
const SECRET_KEY = process.env.TOKEN_KEY;
// Endpoint pour obtenir un token
app.post('/api/token', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email obligatoire!" });
    }
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });
});
// Middleware pour l'authentification
app.use((req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        res.status(401).json({ error: "Échec de l'authentification" });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token invalide' });
        }
        next();
    });
});
function justifyLine(line, lineLength) {
    const words = line.trim().split(' ');
    const totalSpaces = lineLength - line.replace(/ /g, '').length;
    const spacesPerGap = Math.floor(totalSpaces / (words.length - 1));
    const extraSpaces = totalSpaces % (words.length - 1);
    let justifiedLine = '';
    for (let i = 0; i <= words.length; i++) {
        justifiedLine += words[i];
        if (i < words.length - 1) {
            justifiedLine += ' '.repeat(spacesPerGap);
            if (i < extraSpaces) {
                justifiedLine += ' ';
            }
        }
    }
    return justifiedLine;
}
function justifyText(text, lineLength) {
    const words = text.split(' ');
    let currentLine = '';
    const justifiedLines = [];
    for (const word of words) {
        if (currentLine.length + word.length <= lineLength) {
            currentLine += word + ' ';
        }
        else {
            justifiedLines.push(justifyLine(currentLine, lineLength));
            currentLine = word + ' ';
        }
    }
    // Ajoutez la dernière ligne
    justifiedLines.push(justifyLine(currentLine, lineLength));
    return justifiedLines.join('\n');
}
// Endpoint pour justifier le texte
app.post('/api/justify', (req, res) => {
    const { textToJustify } = req.body;
    const justifiedText = justifyText(textToJustify, 80);
    res.json({ newText: justifiedText });
});
const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
