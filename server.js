mport express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/rhid/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const r = await fetch('https://www.rhid.com.br/v2/api.svc/conecte-se', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: senha,
        domain: 'ilumi'
      })
    });
    const data = await r.json();
    const token = data.accessToken || data.token || data.access_token;
    if (!token) {
      return res.status(401).json({ erro: 'Login inválido', debug: data });
    }
    res.json({ token });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/api/rhid/marcacoes', async (req, res) => {
  const { token, inicio, fim } = req.query;
  try {
    const r = await fetch(
      https://www.rhid.com.br/v2/api.svc/apuracao?data_inicio=${inicio}&data_fim=${fim},
      { headers: { 
        'Authorization': Bearer ${token},
        'Content-Type': 'application/json'
      }}
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'PontoWeb Server OK' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Servidor OK porta', PORT));
