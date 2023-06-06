//main function that activates after the page DOM is ready:
$(function () {
  $(document).ajaxStart(function () {
    $("#spinner").show();
    $("#spinner").addClass("d-flex");
  });
  $(document).ajaxStop(function () {
    $("#spinner").hide();
    $("#spinner").removeClass("d-flex");
  });

  renderCoins()

  $(".close").click(closeModal);

  $(".navbar").on("click", "#search-btn", function () {
    handleSearchBar(displayCoins);
    $("#search-result").val("");
  });
  $("#coinsContainer").on("click", ".more-info", function (event) {

    getCoinDetailsFromClick(event);
  });
  $("#coinsContainer").on("change", ".my-toggle", function () {
    handleToggleChange(this);
  });

  $(".nav-link").each(function () {
    let url = window.location.href;
    if ($(this).attr("href") == url) {
      $(this).addClass("active");
    }
  });
  $(".nav-link").not(".active").removeClass("active");
  $(".nav-link").click(function () {
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
  });
  // clicking on the homepage
  $(".homepage").click(async function () {
    coinsModalArray = [];
    $("#coinsContainer").empty();
    displayCoins = [];
    renderCoins()
  });
  // clicking on about-us
  $("#about-us").on("click", function () {
    aboutMe();
  });
  //clicking on livereports
  $("#liveReports").on("click", function () {
    $("#coinsContainer").empty();
    notFound()
  });
});


