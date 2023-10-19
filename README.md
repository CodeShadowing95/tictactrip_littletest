
# Back - API REST de justification de texte



L'idée principale du projet étant de pouvoir:
* Authentifier au préalable un utilisateur en générant un token d'authentification afin de pouvoir effectuer la justification du texte,
* Suite à l'authentification, l'utilisateur pourra justifier le texte en saisissant son texte dans le champ approprié qui lui retournera son texte justifié
* S'il atteint le nombre maximum de 80000 mots par jour, un message lui notifiant un paiement requis s'affichera





## Installation

Côté serveur et client suite au clonage du projet

```bash
  npm install
```
    
## Tech Stack

**Client:** React, Material UI

**Server:** Node.js, Typescript


## Références de l'API

#### Générer un token d'authentification avec un email

```http
  POST /api/token
```

| Paramètre | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Email utilisateur |

#### Justifier le texte passé en paramètre

```http
  POST /api/justify
```

| Paramètre | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `textToJustify`      | `string` | **Required**. Texte à justifier |

