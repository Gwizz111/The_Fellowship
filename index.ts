import express from "express";
const app = express();

app.set("view engine", "ejs"); // EJS als view engine
app.set("port", 3000);

app.get("/", (req, res) => {
  res.type("text/html");
  res.render("index");
});

app.get("/homepage", (req, res) => {
  res.type("text/html");
  res.render("homepage");
});

app.get("/rounds", (req, res) => {
  res.type("text/html");
  res.render("rounds");
});

app.get("/suddendeath", (req, res) => {
  res.type("text/html");
  res.render("suddendeath");
});

app.get("/favourites", (req, res) => {
  res.type("text/html");
  res.render("favourites");
});

app.get("/blacklist", (req, res) => {
  res.type("text/html");
  res.render("blacklist");
});

app.get("/login", (req, res) => {
  res.type("text/html");
  res.render("login");
});

app.get("/registreer", (req, res) => {
  res.type("text/html");
  res.render("registreer");
});

app.listen(app.get("port"), () =>
  console.log("[server] http://localhost:" + app.get("port"))
);
