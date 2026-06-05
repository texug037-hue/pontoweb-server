import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/rhid/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const r = await fetch('https://www.rhid.com.br/v2/login.svc/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json, text/plain, /',
        'Origin': 'https://www.rhid.com.br',
        'Referer': 'https://www.rhid.com.br/v2/',
      },
      body: JSON.stringify({ domain: null, email: email, password: senha })
    });
    const data = await r.json();
    console.log('RHiD login resposta:', JSON.stringify(data).slice(0, 300));
    const token = data.accessToken || data.token || data.access_token;
    if (token) return res.json({ token });
    return res.status(401).json({ erro: data.error || 'Login invalido', debug: data });
  } catch (e) {
    console.log('Erro:', e.message);
    res.status(500).json({ erro: e.message });
  }
});

app.get('/api/rhid/marcacoes', async (req, res) => {
  const { token, inicio, fim } = req.query;
  const url = 'https://www.rhid.com.br/v2/login.svc/ponto_diario?data_inicio=' + inicio + '&data_fim=' + fim;
  try {
    const r = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Origin': 'https://www.rhid.com.br',
      }
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'PontoWeb Server OK' }));

const PORT = parseInt(process.env.PORT) || 3001;
app.listen(PORT, '0.0.0.0', () => console.log('Servidor OK porta', PORT));
