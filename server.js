import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/rhid/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const r = await fetch('https://www.rhid.com.br/v2/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'https://www.rhid.com.br',
        'Referer': 'https://www.rhid.com.br/'
      },
      body: JSON.stringify({ email, password: senha })
    });
    const data = await r.json();
    if (!r.ok) return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    const token = data.token || data.access_token || data.jwt || data?.data?.token;
    if (!token) return res.status(401).json({ erro: 'Token não encontrado', data });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/api/rhid/marcacoes', async (req, res) => {
  const { token, inicio, fim } = req.query;
  try {
    const r = await fetch(
      `https://www.rhid.com.br/v2/api/comprovantes_marcacao?data_inicio=${inicio}&data_fim=${fim}`,
      { headers: { 
        'Authorization': `Bearer ${token}`,
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
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

--
Enviado de Notas rápido
