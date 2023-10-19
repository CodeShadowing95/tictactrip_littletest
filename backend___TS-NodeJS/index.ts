import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import swaggerUI from "swagger-ui-express"
import swaggerJSDoc from "swagger-jsdoc";

const app = express()

// const swaggerDoc = YAML.load('swagger-spec-test.yml')
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: "Documentation API REST de justification de texte",
      version: '1.0.0',
      description: "API REST de justification et Token d'authentification",
      // servers: ["http://localhost:8000"]
      servers: ["https://justifierking-demo.onrender.com"]
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer'
        }
      }
    }
  },
  apis: ["index.js"]
}

const specs = swaggerJSDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://justifierking.netlify.app/');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.text())
app.use(bodyParser.json({ limit: "30mb" }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cors())
app.use(express.json())


const SECRET_KEY: string = crypto.randomBytes(64).toString('hex');

// Check if the server works properly
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Endpoint pour obtenir un token
/**
 * @swagger
 * /api/token:
 *   post:
 *     summary: Récupération de token
 *     description: Endpoint pour récupérer un token d'authentification.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailUser:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid email
 */
app.post('/api/token', (req: Request, res: Response) => {
  const { emailUser } = req.body;

  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const isValidEmail = emailRegex.test(emailUser)
  if(!isValidEmail) {
    return res.status(400).json({ error: "Erreur: Email non conforme!" })
  }

  if (!emailUser) {
    return res.status(400).json({ error: "Email obligatoire!" })
  }

  const token = jwt.sign({ emailUser }, SECRET_KEY, { expiresIn: '24h' })
  res.status(200).json({ email: emailUser, tokenID: token })
})

// On complète avec des espaces les lignes de moins de 80 mots
function allSpacesPositions(text: string): number[] {
  let tab: number[] = []
  for (let i = 0; i < text.length; i++)  {
    if(text.charAt(i) === ' ') {
      tab.push(i)
    }
  }

  return tab
}

// On partitionne les textes légèrement inférieurs à 80 mots
function justifyText(text: string, maxCharsPerLine: number): string {
  const arrayText: string[] = text.split(' ')
  let temp: string = ''
  let tab: string[] = []
  let newText: string = ''

  for (let word of arrayText) {
    if(temp.length + word.length <= maxCharsPerLine) {
      temp += word + ' '
    } else {
      tab.push(temp.trim())
      temp = ''
      temp += word + ' '
    }
  }
  tab.push(temp.trim())
  
  
  for (let text of tab) {
    if(maxCharsPerLine - text.length !== 0) {
      let extraSpacesCount: number = ' '.repeat(maxCharsPerLine - text.length).length
      while(extraSpacesCount > 0) {
        const spacePositions: number[] = allSpacesPositions(text)
        const idx: number = Math.floor(Math.random() * spacePositions.length)
        const randomSpaceIndex: number = spacePositions[idx]
        text = text.slice(0, randomSpaceIndex) + ' ' + text.slice(randomSpaceIndex)
        extraSpacesCount--
      }
      newText += (text + '\n')
    } else {
      newText += (text + '\n')
    }
  }

  return newText
}

// Objet pour stocker le quota quotidien par token
const quotaQuotidien = new Map<string, number>()

// Middleware pour vérifier le taux limite de mots par token
const checkRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');
  const textToJustify = req.body as string
  
  if(token) {
    // On compte le nombre de mots du texte à justifier
    const wordsLength = textToJustify.length

    // On vérifie si pour le token, il y a déjà eu un nombre de mots utilisés
    if(quotaQuotidien.has(token)) {
      const usedWordsLength = quotaQuotidien.get(token) || 0
      // On vérifie si le nombre de mots courant du token + le nombre de mots de la requête est supérieure à 80000
      const rateLimit = usedWordsLength + wordsLength
      if(rateLimit > 80000) {
        // Si la somme dépasse, on renvoie une erreur 402 Payment required
        res.status(402).json({ error: 'Payment Required' })
      } else {
        // Sinon on ajoute le nombre de mots utilisés lors de la requête au nombre de mots courant du token
        quotaQuotidien.set(token, rateLimit)
        next()
      }
    } else {
      quotaQuotidien.set(token, wordsLength)
      next()
    }
  } else {
    res.status(401).json({ error: 'Échec: Token requis' })
    return
  }
}

// Endpoint pour justifier le texte
/**
 * @swagger
 * /api/justify:
 *   post:
 *     summary: Justification de texte
 *     description: Endpoint pour justifier un texte, suite à l'authentification de l'utilisateur.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         text/plain:
 *           schema:
 *             type: object
 *             properties:
 *               textToJustify:
 *                 type: string
 *     responses:
 *       200:
 *         description: Texte justifié
 *         content:
 *           text/plain:
 *             schema:
 *               type: object
 *               properties:
 *                 justifiedText:
 *                   type: string
 *                 currentRate:
 *                   type: integer
 *       400:
 *         description: Texte à justifier obligatoire
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Problème d'authentification (Token non défini)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       402:
 *         description: Nombre limite de 80000 mots par jour atteint
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.post('/api/justify', checkRateLimitMiddleware, (req: Request, res: Response) => {
  const textToJustify = req.body as string

  if(!textToJustify) {
    return res.status(400).json({ error: "Texte à justifier obligatoire" })
  }

  const wordsLength = textToJustify.length

  if(wordsLength > 80000) {
    res.status(402).json({ error: 'Payment Required'})
  } else {
    const justifiedText = justifyText(textToJustify, 80)
    console.log(justifiedText);
    
    res.status(200).json({ justifiedText, currentRate: wordsLength })
  }
})

const port = 8000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})

export default app