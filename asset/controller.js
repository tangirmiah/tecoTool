$(document).ready(function() {
  $(".modal").modal();
});

$(document).ready(function() {
  $(".sidenav").sidenav();
});

$(document).ready(function() {
  $(".collapsible").collapsible();
});

$(".dropdown-trigger").dropdown();

$(document).ready(function() {
  $("select").formSelect();
});

$(document).ready(function() {
  $(".readMore").click(function() {
    $(this)
      .siblings()
      .toggleClass("truncate");
    var text = $(this).text();
    $(this).text(text == "read more" ? "read less" : "read more");
  });
});

document.addEventListener("DOMContentLoaded", function() {
  var elems = document.querySelectorAll(".datepicker");
  var instances = M.Datepicker.init(elems, {
    container: "body",
    format: "yyyy-mm-dd"
  });
});

$(document).ready(function() {
  $("#loginFailed")
    .delay(2000)
    .fadeOut(2000);
});
