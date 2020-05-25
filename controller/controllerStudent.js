module.exports = function (app, parsed, connection) {
  app.get("/studentDash/:userID/:projectID", parsed, (req, res, next) => {
    var start = new Date().getTime();
    connection.query(
      "SELECT * FROM `task` WHERE (task.userID = '" +
        req.params.userID +
        "' AND task.projectID = '" +
        req.params.projectID +
        "') ORDER BY PRIORITY DESC, taskID DESC;" +
        "SELECT feedback.feedbackInfo FROM `feedback` INNER JOIN `projects` " +
        "on feedback.projectID = projects.projectID WHERE projects.projectID =" +
        req.params.projectID +
        " ORDER BY feedback.feedbackID DESC LIMIT 1;" +
        "SELECT feedback.feedbackInfo FROM `feedback` INNER JOIN `projects` " +
        "on feedback.projectID = projects.projectID WHERE projects.projectID =" +
        req.params.projectID +
        ";",

      (err, row, field) => {
        if (!err) {
          res.render("studentDash", {
            data: row,
            uID: req.session.userID,
            pID: req.params.projectID,
          });
          var end = new Date().getTime();
          var time = end - start;
          console.log("Execution time: " + time);
        } else {
          console.log(err);
        }
      }
    );
  });

  app.get("/studentGroup/:userID", (req, res, next) => {
    connection.query(
      "SELECT groups.groupName, projects.projectName, projects.projectID, user.userID FROM `groups` INNER JOIN `projects` " +
        "on groups.groupID = projects.groupID INNER JOIN `groups_user` on groups_user.groupID = groups.groupID INNER JOIN `user` " +
        "on groups_user.userID = user.userID WHERE user.userID = " +
        req.params.userID +
        ";",

      (err, row, field) => {
        if (!err) {
          //console.log(req.params.uID);
          console.log("this is me" + req.session.userID);
          res.render("studentGroup", { data: row, session: req.session });
        } else {
          console.log(err);
        }
      }
    );
  });

  //adding task from student dash
  app.post(
    "/studentDashTaskAdd/:userID/:projectID",
    parsed,
    (req, res, next) => {
      //console.log(req.body);

      connection.query(
        "INSERT INTO task(priority,description,deadline,title,userID,projectID) values('" +
          req.body.taskPriority +
          "','" +
          req.body.taskDescription +
          "','" +
          req.body.taskDeadline +
          "','" +
          req.body.taskTitle +
          "','" +
          req.params.userID +
          "','" +
          req.params.projectID +
          "');"
      );
      //console.log(req.params.userID); "/studentDash/" + req.params.userID + "/" + req.params.projectID

      res.redirect("back");
    }
  );

  //deleting task
  app.post(
    "/studentDashTaskDelete/:userID/:projectID/:taskID",
    parsed,
    (req, res, next) => {
      connection.query(
        "DELETE FROM `task` WHERE taskID = '" + req.params.taskID + "';",

        (err, row, field) => {
          if (!err) {
            res.redirect("back");
          } else {
            console.log(err);
          }
        }
      );
    }
  );

  // change status of task
  app.post(
    "/changeTaskStatus/:userID/:projectID/:taskID",
    parsed,
    (req, res, next) => {
      connection.query(
        "UPDATE `task` SET task.status = (NOT task.status) WHERE taskID = '" +
          req.params.taskID +
          "';",
        (err, row, field) => {
          if (!err) {
            res.redirect("back");
          } else {
            console.log(err);
          }
        }
      );
    }
  );

  //edit task
  app.post(
    "/studentDashTaskEdit/:userID/:projectID/:taskID",
    parsed,
    (req, res, next) => {
      connection.query(
        "UPDATE  `task` SET \
        priority ='" +
          req.body.taskPriorityEdit +
          "'," +
          "description ='" +
          req.body.taskDescription +
          "'," +
          "deadline ='" +
          req.body.taskDeadline +
          "'," +
          "title = '" +
          req.body.taskTitle +
          "'," +
          "userID = '" +
          req.params.userID +
          "'" +
          "WHERE taskID ='" +
          req.params.taskID +
          "';",
        (err, row, field) => {
          if (!err) {
            res.redirect("back");
          } else {
            console.log(err);
          }
        }
      );
    }
  );
};
