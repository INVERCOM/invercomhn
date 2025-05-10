const URI_MONGO = process.env.URI_MONGO;
const HOST_MONGO = process.env.HOST_MONGO;
const PORT_MONGO = process.env.PORT_MONGO;
const DB_MONGO = process.env.DB_MONGO;
const USER_MONGO = process.env.USER_MONGO;
const PASSWORD_MONGO = process.env.PASSWORD_MONGO;
const mongoose = require('mongoose');

const conn = URI_MONGO ? 
    URI_MONGO : (
    USER_MONGO && PASSWORD_MONGO ?
    `mongodb://${USER_MONGO}:${PASSWORD_MONGO}@${HOST_MONGO}:${PORT_MONGO}` :
    `mongodb://${HOST_MONGO}:${PORT_MONGO}/${DB_MONGO}`);
mongoose.connect(conn, { useUnifiedTopology: true, useNewUrlParser: true })
    .then((con)=>{ console.log("✅ Mongo conectado"); })
    .catch((err)=>{ console.log("❌ No se pudo conectar a mongo", err); });

module.exports = {
    mongoose
}