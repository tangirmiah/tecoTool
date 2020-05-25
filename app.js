const controllerStudent = require("./controller/controllerStudent");
const controllerSupervisor = require("./controller/controllerSupervisor");
const controllerTeamLeader = require("./controller/controllerTeamLeader");
var $ = require("jquery");
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const rootDir = path.dirname(process.mainModule.filename);
const app = express();
//set view pages
app.set("views", path.join(rootDir, "views/"));

//set rendering engine
app.set("view engine", "ejs");

//set assets
app.use("/asset", express.static("asset"));

//connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "myDatabase",
  multipleStatements: true
});

const parsed = bodyParser.urlencoded({ extended: true });

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

//login
app.get("/", (req, res, next) => {
  if (req.session !== undefined) {
    if (req.session.userType == "student") {
      res.redirect("/studentGroup/" + req.session.userID);
    } else if (req.session.userType == "supervisor") {
      res.redirect("/groupsSupervisor/" + req.session.userID);
    } else {
      res.render("index", { message: "false", session: req.session });
    }
  } else {
    res.render("index", { message: "false", session: req.session });
  }
});

app.post("/auth", parsed, (req, res, next) => {
  let username = req.body.userName;
  let password = req.body.password;
  if (username && password) {
    connection.query(
      "SELECT userID, type FROM user WHERE userName = ? AND password = ?",
      [username, password],
      (err, row, field) => {
        if (!err) {
          //console.log(row);

          if (row[0] != undefined && row[0].type == "supervisor") {
            req.session.userID = row[0].userID;
            req.session.userType = row[0].type;
            res.redirect("/groupsSupervisor/" + row[0].userID);
          } else if (row[0] != undefined && row[0].type == "student") {
            req.session.userID = row[0].userID;
            req.session.userType = row[0].type;
            res.redirect("/studentGroup/" + row[0].userID);
          } else {
            res.render("index", { message: "true" });
          }
        } else {
          console.log(err);
        }
      }
    );
  }
});

app.get("/logOut", parsed, (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

controllerStudent(app, parsed, connection);
controllerSupervisor(app, parsed, connection, $);
controllerTeamLeader(app, parsed, connection);

app.listen(3000);
