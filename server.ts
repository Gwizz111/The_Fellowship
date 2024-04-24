import express from "express";
import { randomInt } from "crypto";
const app = express();

//Bearer token The One Api
const headers = {
  Accept: "application/json",
  Authorization: "Bearer RWp8MgXHV3cbSRQgxAY4",
};

app.set("view engine", "ejs"); // EJS als view engine
app.set("port", 3000);

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/index.ejs");
});

app.get("/homepage", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/homepage.ejs");
});

app.get("/rounds", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/rounds.ejs");
});

app.get("/suddendeath", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/suddendeath.ejs");
});

app.get("/favourites", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/favourites.ejs");
});

app.get("/blacklist", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/blacklist.ejs");
});

app.get("/login", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/login.ejs");
});

app.get("/registreer", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/registreer.ejs");
});


//The One API
app.get("/quotes",async (req,res) =>{
  let response = await fetch("https://the-one-api.dev/v2/quote", { headers, });
    let quotes = await response.json();
    res.type("application/json");
    res.json(quotes);
});



app.listen(app.get("port"), () =>
  console.log("[server] http://localhost:" + app.get("port"))
);
