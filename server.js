import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/rhid/login', async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    // Primeira tentativa: sem domain (deixa vazio)
    const r = await fetch('https://www.rhid.com.br/v2/api.svc/conecte-se', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: senha, domain: '' })
    });
    const data = await r.json();
    console.log('RHiD resposta:', JSON.stringify(data));
    
    // Se retornou lista de clientes, usa o primeiro domain
    if (data.listCustomer && data.listCustomer.length > 0) {
      const domain = data.listCustomer[0].domain;
      console.log('Domain encontrado:', domain);
      
      // Segunda tentativa com o domain correto
      const r2 = await fetch('https://www.rhid.com.br/v2/api.svc/conecte-se', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha, domain })
      });
      const data2 = await r2.json();
      console.log('RHiD resposta 2:', JSON.stringify(data2));
      
      if (data2.accessToken) {
        return res.json({ token: data2.accessToken });
      }
    }
    
    // Tenta usar o token direto da primeira resposta
    if (data.accessToken) {
      return res.json({ token: data.accessToken });
    }
    
    // Retorna o erro do RHiD para diagnóstico
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
app.listen(process.env.PORT || 3001, () => console.log('OK'));
