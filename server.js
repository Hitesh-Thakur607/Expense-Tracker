const express = require('express');
const mongoose = require('mongoose');
const connectdb=require('./data/mongodb');
const cookieParser = require('cookie-parser');
const path = require('path');

const userRoutes = require('./router/user');
const taskRoutes = require('./router/task');
connectdb();
const app = express();
app.use(express.json());
app.use(cookieParser());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use("/user", userRoutes);
app.use("/task", taskRoutes);

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})