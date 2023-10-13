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
// Endpoint pour obtenir un endpoint
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
function justifyText() {
}
// Endpoint pour justifier le texte
app.post('/api/justify', (req, res) => {
    const { textToJustify } = req.body;
    // Opération de justification du texte
    const justifiedText = "";
    // Texte justifié
    res.json({ newText: justifiedText });
});
const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
