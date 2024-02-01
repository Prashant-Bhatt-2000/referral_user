const dotenv = require('dotenv')
const app = require('./app')
const mongooseConnection = require('./database/mongooseConnection')

dotenv.config({path: './config/config.env'})


mongooseConnection()
app.listen(process.env.PORT, ()=>  { 
    console.log(`Server is running on http:localhost:${process.env.PORT}`)
})