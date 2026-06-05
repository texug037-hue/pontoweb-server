import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/rhid/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const r = await fetch('https://www.rhid.com.br/v2/api.svc/conecte-se', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: senha, domain: '' })
    });
    const data = await r.json();
    console.log('RHiD:', JSON.stringify(data).slice(0,300));
    if (data.listCustomer && data.listCustomer.length > 0) {
      const domain = data.listCustomer[0].domain;
      const r2 = await fetch('https://www.rhid.com.br/v2/api.svc/conecte-se', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha, domain })
      });
      const data2 = await r2.json();
      if (data2.accessToken) return res.json({ token: data2.accessToken });
    }
    if (data.accessToken) return res.json({ token: data.accessToken });
    return res.status(401).json({ erro: data.error || 'Login inválido', rhid: data });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/api/rhid/marcacoes', async (req, res) => {
  const { token, inicio, fim } = req.query;
  try {
    const r = await fetch(
      https://www.rhid.com.br/v2/api.svc/apuracao?data_inicio=${inicio}&data_fim=${fim},
      { headers: { 'Authorization': Bearer ${token} }}
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'PontoWeb Server OK' }));

const PORT = parseInt(process.env.PORT) || 3001;
app.listen(PORT, '0.0.0.0', () => console.log('Servidor OK porta', PORT));
