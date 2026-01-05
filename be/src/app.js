require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Routes = require('./routes/routes');



const app = express();
app.use(cors());
app.use(express.json());


// Mount all application routes under /api
app.use('/api', Routes);


app.get('/', (req, res) => res.json({ ok: true, message: 'API running' }));


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'http://localhost';

app.listen(PORT, () => {
    console.log(`Server running at ${HOST}:${PORT}`);
});
