'use strict';
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("../config");
const firebase  = require("../db");

const app = express();
const doctorRoutes = require('../routes/doctorRoutes');
const searchRoutes = require('../routes/searchRoutes');
const authRoutes = require('../routes/authRoutes');
const inductiveKBRoutes = require('../routes/inductiveKBRoutes');
const inductiveKBSearchRoutes = require('../routes/inductiveKBSearchRoutes');
const doctorsPanelRoutes = require('../routes/doctorsPanelRoutes');
const pauseCasesRoutes = require('../routes/pauseCasesRoutes');
const deductiveRoutes = require('../routes/deductiveRoutes');



app.use(express.json());
app.use(cors());
app.use(bodyParser.json());



app.use('/api',doctorRoutes.routes);
app.use('/api', searchRoutes.routes);
app.use('/api',authRoutes.routes);
app.use('/api',inductiveKBRoutes.routes);
app.use('/api',inductiveKBSearchRoutes.routes);
app.use('/api',doctorsPanelRoutes.routes);
app.use('/api',pauseCasesRoutes.routes);
app.use('/api',deductiveRoutes.routes);

//const port = process.env.port || 3000;

app.listen(config.port), () => {
    console.log(`connection is setup at ${port}`);
};