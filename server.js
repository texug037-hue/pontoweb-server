import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

async function tentarLogin(email, senha, domain) {
  const endpoints = [
    'https://www.rhid.com.br/v2/api.svc/conecte-se',
    'https://www.rhid.com.br/v2/api/auth/login',
    'https://www.rhid.com.br/v2/api/login',
  ];
  const payloads = [
    { email, password: senha, domain },
    { email, senha, domain },
    { login: email, password: senha, domain },
  ];

  for (const endpoint of endpoints) {
    for (const payload of payloads) {
      try {
        const r = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const text = await r.text();
        console.log('Endpoint:', endpoint, 'Status:', r.status, 'Resp:', text.slice(0, 200));
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          const data = JSON.parse(text);
          const token = data.accessToken || data.token || data.access_token;
          if (token) return { token };
          if (data.listCustomer && data.listCustomer.length > 0) {
            return { listCustomer: data.listCustomer, data };
          }
          if (r.ok) return { data };
        }
      } catch(e) {
        console.log('Erro:', endpoint, e.message);
      }
    }
  }
  return null;
}

app.post('/api/rhid/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    let result = await tentarLogin(email, senha, '');
    if (result && result.listCustomer) {
      const domain = result.listCustomer[0].domain;
      result = await tentarLogin(email, senha, domain);
    }
    if (result && result.token) return res.json({ token: result.token });
    return res.status(401).json({ erro: 'Login invalido', debug: result });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/api/rhid/teste', async (req, res) => {
  const { email, senha } = req.query;
  const result = await tentarLogin(email, senha, '');
  res.json(result || { erro: 'Nenhum endpoint funcionou' });
});

app.get('/api/rhid/marcacoes', async (req, res) => {
  const { token, inicio, fim } = req.query;
  const url = 'https://www.rhid.com.br/v2/api.svc/apuracao?data_inicio=' + inicio + '&data_fim=' + fim;
  try {
    const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'PontoWeb Server OK' }));

const PORT = parseInt(process.env.PORT) || 3001;
app.listen(PORT, '0.0.0.0', () => console.log('Servidor OK porta', PORT));
