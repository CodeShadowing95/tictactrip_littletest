import express, { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";

const app = express()
app.use(express.json())
dotenv.config()

const SECRET_KEY: string = process.env.TOKEN_KEY!

// Endpoint pour obtenir un token
app.post('/api/token', (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email obligatoire!" })
    }

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token })
})

// Middleware pour l'authentification
app.use((req: Request, res: Response, next) => {
    const token: string = req.header('Authorization')!

    if (!token) {
        res.status(401).json({ error: "Échec de l'authentification" })
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: 'Token invalide' });
        }
        next();
    })
})

function justifyLine(line: string, lineLength: number): string {
    const words = line.trim().split(' ')
    const totalSpaces = lineLength - line.replace(/ /g, '').length
    const spacesPerGap = Math.floor(totalSpaces / (words.length - 1))
    const extraSpaces = totalSpaces % (words.length - 1)
    let justifiedLine = ''

    for(let i = 0; i <= words.length; i++) {
        justifiedLine += words[i]
        if (i < words.length - 1) {
            justifiedLine += ' '.repeat(spacesPerGap)
            if (i < extraSpaces) {
                justifiedLine += ' '
            }
        }
    }

    return justifiedLine
}

function justifyText(text: string, lineLength: number): string {
    const words = text.split(' ');
    let currentLine = '';
    const justifiedLines = [];
  
    for (const word of words) {
      if (currentLine.length + word.length <= lineLength) {
        currentLine += word + ' ';
      } else {
        justifiedLines.push(justifyLine(currentLine, lineLength));
        currentLine = word + ' ';
      }
    }
  
    // Ajoutez la dernière ligne
    justifiedLines.push(justifyLine(currentLine, lineLength));
  
    return justifiedLines.join('\n');
}

// Endpoint pour justifier le texte
app.post('/api/justify', (req: Request, res: Response) => {
    const { textToJustify } = req.body

    const justifiedText = justifyText(textToJustify, 80)

    res.json({ newText: justifiedText })
})

const port = 8000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})