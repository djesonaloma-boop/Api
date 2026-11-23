const express = require("express");
const cors = require("cors");
const firebaseConfig = require("./firebase.js");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req,res)=> res.json({ status:"ok", app:"GENESIX", project: firebaseConfig.projectId }));
app.get("/api/config", (req,res)=> res.json({ projectId: firebaseConfig.projectId, authDomain: firebaseConfig.authDomain, databaseURL: firebaseConfig.databaseURL }));

// Discussions : stockées dans Firebase RTDB côté front, ici on expose juste la liste
app.get("/api/discussions", (req,res)=> res.json({ ok:true, message:"Discussions via Firebase Realtime Database - noeud genesix/discussions" }));

module.exports = app;
