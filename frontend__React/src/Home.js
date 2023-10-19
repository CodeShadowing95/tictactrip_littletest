import { useEffect, useState } from 'react'
import { Box, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { JustifyIcon, MainBG } from './constants'

const Home = () => {
  const visitor = JSON.parse(localStorage.getItem('visitor'))
  const initialState = { email: '' }
  const [formData, setFormData] = useState(initialState)
  const [secretToken, setSecretToken] = useState('')
  const [textToJustify, setTextToJustify] = useState('')
  const [justifiedText, setJustifiedText] = useState([])

  const [message1, setMessage1] = useState('')
  const [message2, setMessage2] = useState('')
  const [errorToken, setErrorToken] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [warningText, setWarningText] = useState('')
  const [warningToken, setWarningToken] = useState('')

  const handleEmailChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleChangeTextArea = (e) => {
    setTextToJustify(e.target.value);
  }
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const localStorageData = JSON.parse(localStorage.getItem('visitor'))

    if (formData?.email === '') {
      alert('Veuillez saisir une adresse mail valide!');
      return
    }

    if (localStorageData) {
      setWarningToken('Attention: Utilisateur déjà authentifié!')
    } else {
      const emailUser = formData?.email
  
      const response = await fetch('http://localhost:8000/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailUser })
      });
  
      if(!response.ok) {
        setErrorToken('Erreur de génération du token')
      } else {
        setErrorMessage('')
        setWarningToken('')
        setWarningText('')
        setErrorToken('')
        setMessage1('')
        setMessage2('')
  
        const data = await response.json()
        setSecretToken(data?.tokenID)
        localStorage.setItem('visitor', JSON.stringify(data))
        setMessage1('Token généré avec succès!')
      }
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const localStorageData = JSON.parse(localStorage.getItem('visitor'))

    if(!localStorageData?.tokenID){
      setErrorMessage('Token requis: Veuillez vous authentifier!')
    } else {
      if(textToJustify === '') {
        setWarningText('Veuillez saisir votre texte')
      } else {
        setErrorMessage('')
        setWarningText('')
        setErrorToken('')
        setMessage1('')
        setMessage2('')
        setWarningToken('')

        fetch('http://localhost:8000/api/justify', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'Authorization': `Bearer ${secretToken}`,
          },
          body: textToJustify,
        })
        .then(async (response) => {
          if(response.status === 401){
            setErrorMessage('Échec de l\'opération: Token requis')
          } else if(response.status === 402){
            alert('Payment Required!')
          }
          if(!response.ok) {
            setMessage2('Erreur justification de texte')
          } else {
            // console.log(response);
            const data = await response.json()
            if(!localStorageData?.currentRate) {
              localStorageData.currentRate = data?.currentRate
            } else {
              localStorageData.currentRate += data?.currentRate
            }
            localStorageData.storeDate = new Date().toLocaleDateString()
            localStorage.setItem('visitor', JSON.stringify(localStorageData))
            setJustifiedText(data?.justifiedText)
          }
        })
        .catch((err) => {
          console.error("Une erreur est survenue lors de l'opération", err)
        })
      }
    }
  }

  const logout = () => {
    localStorage.clear()
    window.location.reload()
  }

  useEffect(() => {
    if(visitor) {
      const storedDate = visitor?.storeDate
      const currentDate = new Date().toLocaleDateString()
  
      if(storedDate !== currentDate) {
        visitor.currentRate = 0
        visitor.storeDate = currentDate
        localStorage.setItem('visitor', JSON.stringify(visitor))
      }
    }
  })
  

  return (
    <Box sx={{ display: "flex", height: "100dvh", backgroundImage: `url('${MainBG}')`, backgroundSize: "cover", backgroundPosition: "center", top: 0 }}>
      <Stack sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", }} spacing={5}>
        {/* Application */}
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 3 }}>
          {/* Presentation of the exercise */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
            <JustifyIcon sx={{ fontSize: "45px", color: "#fff" }} />
            <Typography variant='h1' sx={{ fontFamily: "Montserrat", fontSize: "49px", lineHeight: "55px", fontWeight: 800, color: "#FFF"}}>TheJustifierKing 👑</Typography>
          </Box>
          <Typography sx={{ fontFamily: "Montserrat", fontWeight: 300, textAlign: "center", color: "#e6e6e6" }}>Profitez pleinement de notre outil de justification de texte. <br />Et si vous testiez par vous-même</Typography>
        </Box>

        {/* Main feature */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#fff", borderRadius: "10px", padding: "20px", width: "70%" }}>
          <Grid container spacing={3}>
            {/* Email address & Textarea for text to justify */}
            <Grid item xs={12} sm={12} md={4} lg={4}>
              <Stack spacing={4}>
                {/* Form Email address */}
                <Box component="form" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10px", borderRadius: "5px", border: "1px solid #e1e1e1", gap: 1 }} onSubmit={handleEmailSubmit}>
                  <Typography sx={{ fontFamily: "Montserrat", fontWeight: "500", alignSelf: "start", backgroundColor: "#FFF", marginTop: "-21px" }}>Adresse email</Typography>
                  {!visitor ?
                    <TextField type='email' size='small' name='email' placeholder='Votre adresse mail' fullWidth onChange={handleEmailChange} />
                    :
                    <Typography sx={{ fontFamily: "Montserrat", fontWeight: "700", alignSelf: "start" }}>{visitor?.email}</Typography>
                  }
                  {errorToken !== '' ? <Typography sx={{ fontFamily: "Montserrat", color: "red", fontSize: "12px", fontWeight: 700, alignSelf: "start" }}>❌{errorToken}</Typography> : ''}
                  {warningToken !== '' ? <Typography sx={{ fontFamily: "Montserrat", color: "orange", fontSize: "12px", fontWeight: 700, alignSelf: "start" }}>⚠️{warningToken}</Typography> : ''}
                  {message1 !== '' ? <Typography sx={{ fontFamily: "Montserrat", color: "#2e9e35", fontSize: "12px", fontWeight: 700, alignSelf: "start" }}>✅{message1}</Typography> : ''}
                  {!visitor ?
                    <Button type='submit' variant='contained' color='success' sx={{ fontFamily: "Montserrat", alignSelf: "end" }}>Générer un token</Button>
                    :
                    <Button type='button' variant='contained' color='error' sx={{ fontFamily: "Montserrat", alignSelf: "end" }} onClick={logout}>Déconnexion</Button>
                  }
                </Box>
                {/* Form Textarea */}
                <Box component="form" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10px", borderRadius: "5px", border: "1px solid #e1e1e1", gap: 1 }} onSubmit={handleSubmit}>
                  <Typography sx={{ fontFamily: "Montserrat", fontWeight: "500", alignSelf: "start", backgroundColor: "#FFF", marginTop: "-21px" }}>Texte à justifier</Typography>
                  <TextField
                    name='textToJustify'
                    multiline
                    rows={10}
                    placeholder='Saisissez le texte à justifier ici...'
                    onChange={handleChangeTextArea}
                    fullWidth
                  />
                  {warningText !== '' ? <Typography sx={{ fontFamily: "Montserrat", color: "orange", fontSize: "12px", fontWeight: 700, alignSelf: "start" }}>⚠️{warningText}</Typography> : ''}
                  {message2 !== '' ? <Typography sx={{ fontFamily: "Montserrat", color: "orange", fontSize: "12px", fontWeight: 700, alignSelf: "start" }}>⚠️{message2}</Typography> : ''}
                  {errorMessage !== '' ? <Typography sx={{ fontFamily: "Montserrat", color: "red", fontSize: "12px", fontWeight: 700, alignSelf: "start" }}>❌{errorMessage}</Typography> : ''}
                  <Button type='submit' variant='contained' color='info' sx={{ fontFamily: "Montserrat", alignSelf: "end" }}>Justifier</Button>
                </Box>
              </Stack>
            </Grid>

            {/* Area to display the text & demo of the justified text */}
            <Grid item xs={12} sm={12} md={8} lg={8}>
              <Stack spacing={1}>
                <Typography sx={{ fontFamily: "Montserrat", fontSize: "25px", fontWeight: 600 }}>Rendu</Typography>
                
                <Box sx={{ padding: "15px", borderRadius: "5px", border: "1px solid #e1e1e1", height: "450px", maxWidth: "800px", overflow: "auto" }}>
                  {justifiedText.length !== 0 ?
                    <pre style={{ fontSize: "15px" }}>
                      {justifiedText}
                    </pre>
                    :
                    <Typography sx={{ fontFamily: "Montserrat", color: "#a6a6a6" }}>
                      Aucun texte à afficher pour le moment...
                    </Typography>
                  }
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Social Media */}
        <Box></Box>
      </Stack>
    </Box>
  )
}

export default Home