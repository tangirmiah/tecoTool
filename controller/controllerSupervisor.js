module.exports = function (app, parsed, connection, $) {
  app.get("/groupsSupervisor/:userID", (req, res, next) => {
    //console.log(req.session);
    connection.query(
      "SELECT module.moduleName, module.moduleID, user.userID FROM `module` INNER JOIN `user_module` on module.moduleID = user_module.moduleID " +
        "INNER JOIN `user` on user_module.userID = user.userID WHERE user.userID = " +
        req.params.userID +
        ";" +
        "SELECT groups.groupName, projects.projectName, projects.projectID, groups.moduleID from `groups` INNER JOIN `projects` on groups.groupID = projects.groupID " +
        "INNER JOIN `groups_user` on groups_user.groupID = groups.groupID INNER JOIN `user` " +
        "on groups_user.userID = user.userID WHERE user.userID = " +
        req.params.userID +
        ";",

      (err, row, field) => {
        if (!err) {
          //console.log(row);

          let finalRow = row;
          finalRow[0].forEach((element) => {
            element.groups = [];
            finalRow[1].forEach((group) => {
              if (element.moduleID === group.moduleID) {
                element.groups.push(group);
              }
            });
          });

          res.render("groupsSupervisor", {
            data: finalRow,
            groups: row[1],
            session: req.session,
          });
        } else {
          console.log(err);
        }
      }
    );
  });

  app.get("/superDash/:userID/:projectID", (req, res, next) => {
    connection.query(
      "SELECT feedback.feedbackInfo FROM `feedback` INNER JOIN `projects` " +
        "on feedback.projectID = projects.projectID WHERE projects.projectID =" +
        req.params.projectID +
        " ORDER BY feedback.feedbackID DESC LIMIT 1;" +
        "SELECT feedback.feedbackInfo FROM `feedback` INNER JOIN `projects` " +
        "on feedback.projectID = projects.projectID WHERE projects.projectID =" +
        req.params.projectID +
        ";" +
        "SELECT projects.projectName FROM `projects` WHERE projects.projectID=" +
        req.params.projectID +
        ";" +
        " SELECT * FROM `userrole`;" +
        "SELECT user.uName, user.surname, user.userID, user.email from `user`;" +
        "SELECT groups.groupID, groups.groupName from `groups` INNER JOIN `projects` on projects.groupID = groups.groupID " +
        "WHERE projects.projectID = " +
        req.params.projectID +
        " ;" +
        "SELECT user.userID, user.uName, user.surname, user.type , userrole.info FROM user INNER JOIN groups_user on user.userID = groups_user.userID " +
        "INNER JOIN userrole on userrole.userRoleID = groups_user.userRoleID INNER JOIN projects on projects.groupID = groups_user.groupID WHERE projects.projectID = " +
        req.params.projectID +
        " ORDER BY user.type DESC;",

      (err, row, field) => {
        if (!err) {
          //console.log(row);

          res.render("superDash", {
            data: row,
            roles: row[3],
            uID: req.session.userID,
            pID: req.params.projectID,
            autocom: row[4],
            groupID: row[5][0].groupID,
            groupName: row[5][0].groupName,
          });
        } else {
          console.log(err);
        }
      }
    );
  });

  //add member to group
  app.post("/addPerson/:pID/:groupID", parsed, (req, res, next) => {
    connection.query(
      "SELECT user.userID from user WHERE user.email = '" +
        req.body.personName +
        "' ;",
      (err, row, field) => {
        if (!err) {
          console.log(
            req.params.groupID +
              " " +
              row[0].userID +
              " " +
              req.body.roleSelection
          );
          connection.query(
            " INSERT INTO `groups_user` (`groupsUserID`,`groupID`, `userID`, `userRoleID`) VALUES (null,'" +
              req.params.groupID +
              "', '" +
              row[0].userID +
              "', '" +
              req.body.roleSelection +
              "');"
          );
        } else {
          console.log(err);
        }
      }
    );
    //"/superDash/" + req.session.uID + "/" + req.params.pID
    res.redirect("back");
  });

  //adding feedback
  app.post("/addFeedback/:userID/:projectID", parsed, (req, res, next) => {
    connection.query(
      " INSERT INTO `feedback` (`feedbackID`, `projectID`, `userID`, `feedbackInfo`) VALUES (NULL, '" +
        req.params.projectID +
        "', '" +
        req.params.userID +
        "', '" +
        req.body.feedbackDescription +
        "');"
    );
    //"/superDash/" + req.params.userID + "/" + req.params.projectID
    res.redirect("back");
  });

  const task_per_page = 7;
  app.get("/tasks/:userID/:projectID/", parsed, (req, res, next) => {
    const page = +req.query.page || 1;
    let totalTask;
    var start = new Date().getTime();
    connection.query(
      "SELECT SQL_CALC_FOUND_ROWS task.title, task.deadline, task.status, task.description, user.uName, user.surname FROM `task` INNER JOIN `user` on task.userID = user.userID WHERE task.projectID = '" +
        req.params.projectID +
        "'" +
        "LIMIT " +
        (page - 1) * task_per_page +
        "," +
        task_per_page +
        " ;" +
        "SELECT FOUND_ROWS() AS 'numberRows';",
      (err, row, field) => {
        if (!err) {
          totalTasks = " " + row[1][0]["numberRows"];

          res.render("tasks", {
            data: row[0],
            uID: req.session.userID,
            pID: req.params.projectID,
            currentPage: page,
            totalTask: totalTasks,
            hasNextPage: task_per_page * page < totalTasks,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalTasks / task_per_page),
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
};
