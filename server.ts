import express from "express";
import CryptoJS from "crypto-js";
import {MongoClient, ObjectId} from "mongodb"

const dbUri = "mongodb+srv://fellowship:fWsnI39ZT4gLLqWz@cluster0.t5jctlk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(dbUri);
const main = async() => {
  try {
    await client.connect();
    console.log("Connected to database")
  } catch (error) {
    console.error(error);
  }
}
main();

const app = express();

app.set("view engine", "ejs"); // EJS als view engine
app.set("port", 3000);

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended:true}))

app.get("/", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/index.ejs");
});

app.get("/login", (req: any, res: any) => {
  let failed: boolean = false;
  if (req.query.failed == "true") {
    failed = true;
  }
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/login.ejs", {
    failed: failed,
  });
});

interface User {
  _id?: ObjectId;
  username: string;
  password: string;
}
let currentUserId:any;

app.post("/login", async (req: any, res: any) => {
  const formUsername = req.body.username;
  const formPassword = req.body.password;
  let encryptedPassword = CryptoJS.SHA256(formPassword).toString(
    CryptoJS.enc.Hex
  );
  let result = await client
    .db("fellowship")
    .collection("users")
    .findOne<User>({ username: formUsername, password: encryptedPassword });
  if (
    result?.password == encryptedPassword &&
    result?.username == formUsername
  ) {
    currentUserId = result._id;
    res.redirect("/homepage");
  } else {
    res.redirect("/login");
  }
});

app.get("/registreer", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/registreer.ejs");
});

app.post("/registreer", async (req: any, res: any) => {
  const formUsername = req.body.username;
  const formPassword1 = req.body.password;
  const formPassword2 = req.body.password2
  let result = await client
    .db("fellowship")
    .collection("users")
    .findOne<User>({ username: formUsername});
  if (
    result?.username == formUsername || formPassword1 != formPassword2
  ) {
    res.redirect("/registreer")
  }
  else{
    let encryptedPassword = CryptoJS.SHA256(formPassword2).toString(
      CryptoJS.enc.Hex
    );
    let newUser:User = {username: formUsername, password: encryptedPassword} 
    client.db("fellowship")
    .collection("users")
    .insertOne(newUser);
    res.redirect("/homepage")
  }
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



app.listen(app.get("port"), () =>
  console.log("[server] http://localhost:" + app.get("port"))
);

const exit = async () => {
  try {
    await client.close();
    console.log("Disconnected from database");
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
};

process.on("SIGINT", async () => {
  await exit();
  process.exit();
});
