const express = require('express');
const app = express();
const {pool,initDB} = require("./config/db");
const categoryRouter = require("./routes/category")

const PORT = 3001;
app.use(express.json());
app.use("/category",categoryRouter);

initDB();

app.listen(PORT,()=>{
    console.log(`Server is running on port: ${PORT}`)
})