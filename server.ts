import express from "express";
const app = express();

app.set("view engine", "ejs"); // EJS als view engine
app.set("port", 3000);

app.use(express.static(__dirname + '/public'));

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

app.listen(app.get("port"), () =>
  console.log("[server] http://localhost:" + app.get("port"))
);
