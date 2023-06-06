// API - COINS
const coinsUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false";
// SECOND API - COINS INFO
const coinsInfoUrl = "https://api.coingecko.com/api/v3/coins/";
let displayCoins = [];
let coinsModalArray = [];
// get the coins from the url
const fetchCoins = async () => {
  return new Promise((resolve, reject) => {
    $.get({
      url: coinsUrl,
      success: (data) => {
        resolve(data);
      },
      error: (error) => {
        notFound();
        reject(error);
        console.error("Error while fetching the coins", error);
      },
    });
  });
};

// get 100 coins from the url
const renderCoins = async () => {
  const data = await fetchCoins();
  for (let i = 0; i < 100; i++) {
    displayCoins.push(data[i]);
    renderSingleCoin(displayCoins[i], i);
  }
  return displayCoins;
};

//function that renders a coin  and append it to the coins container:
const renderSingleCoin = (singleCoin, index) => {
  let infoId = `coin-${index}-info`;
  let toggleId = `coin-${index}-toggle`;
  let data = "";
  data += `<div class="card  h-100 m-2 bg-secondary " id="${index}" style="width:300px">
            <div class="card-body">
              <div class="d-flex justify-content-between flex-wrap">
                <h4 class="card-title">${singleCoin.name}</h4>
                <div class=" form-check form-switch form-switch-lg">
                  <input class="form-check-input my-toggle check-${singleCoin.name}" id="${toggleId}" type="checkbox" name="${singleCoin.name}">
                </div>
              </div>
              <div class="card-text mb-5">${singleCoin.symbol}</div>
              <div>
                <button id="${singleCoin.id}" class="btn btn-primary more-info ">More Info</button>
              </div>
              <div class="mt-2" id="more-info-${infoId}"</div>
            </div>
          </div>`;
  $("#coinsContainer").append(data);
};

// FUNCTION fetchCoinsData GETS A SPECIFIC COIN DATA FROM THA API AND SAVE IN CACHE FOR 2 MIN
const fetchCoinsData = async (coinId) => {
  const cacheKey = `coin_${coinId}`;
  const cache = await caches.open("coinsCache");
  const cachedResponse = await cache.match(cacheKey);
  // IF RESPONSE IS IN CACHE RESOLVE FROM CACHE AND NOT API
  if (cachedResponse) {
    const cachedData = await cachedResponse.json();
    return Promise.resolve(cachedData);
  }
  // IF RESPONSE NOT IN CACHE RESOLVE FROM API AND SAVE TO CACHE
  return new Promise((resolve, reject) => {
    $.get({
      url: coinsInfoUrl + coinId,
      success: (data) => {
        const response = new Response(JSON.stringify(data), {
          headers: { "Cache-Control": "max-age=120" },
        });
        cache.put(cacheKey, response);
        resolve(data);
        setTimeout(() => {
          cache.delete(cacheKey); // DELETE CACHE AFTER 2 MIN
        }, 120000);
      },
      error: (error) => {
        reject("Error while fetching details about the coin", error);
      },
    });
  });
};

// FUNCTION getCoinDetailsFromClick GET ID AND INDEX OF CLICKED COIN
const getCoinDetailsFromClick = (event) => {
  let coinIndex = $(event.target).closest(".card")[0].id;
  let coinId = displayCoins[coinIndex].id.toLowerCase();

  if (!$(`#more-info-coin-${coinIndex}-info`).hasClass("show")) {
    coinData(coinId, coinIndex);
  } else {
    $(`#more-info-coin-${coinIndex}-info`).removeClass("show");
  }
};

// a function that handles the press on more info button.
const coinData = async (coinId, coinIndex) => {
  let coinData = await fetchCoinsData(coinId);
  let targetId = `coin-${coinIndex}-info`;

  $(`#more-info-${targetId}`)
    .html(
      `
  <img class="collapseInfo" src="${coinData.image.small}">
  <p>${coinData.market_data.current_price.usd}$</p>
  <p>${coinData.market_data.current_price.eur}€</p>
  <p>${coinData.market_data.current_price.ils}₪</p>
`
    )
    .collapse("toggle");
};

//function that handles press on search button:
const handleSearchBar = async (myCoins) => {
  let searchValue = "";
  searchValue += $("#search-result").val().toLowerCase();
  let count = 1;
  if (!searchValue) return;
  $("#coinsContainer").html("");
  coinsModalArray = [];
  myCoins.map((item, index) => {
    let itemNameInLowercase = item.name.toLowerCase();
    if (itemNameInLowercase.startsWith(searchValue)) {
      count++;
      renderSingleCoin(item, index);
    }
  });
  if (count === 1) {
    notFound();
  }
};

const notFound = () => {
  $("#coinsContainer").html(`<div class="w-100" >
      <div class="d-flex align-items-center justify-content-center bg-white " id="notFound">
    <div class="text-center">
        <h1 class=" fw-bold text-danger ">404</h1>
        <p class="fs-3"> <span class="text-danger">Opps!</span> Page not found.</p>
        <p class="lead">
            The page you’re looking for doesn’t exist.
          </p>
    </div></div>
</div>`);
};

//a function that handles press on toggle button:
const handleToggleChange = (toggleEl) => {
  let checkBoxId = toggleEl.id;
  let checkBoxIndex = checkBoxId.split("-")[1];
  let coinName = displayCoins[checkBoxIndex].name;
  if ($(toggleEl).is(":checked")) {
    if (coinsModalArray.length === 5) {
      $(toggleEl).prop("checked", false);
      openModal(toggleEl);
      return;
    }
    coinsModalArray.push(coinName);
  } else {
    let pos = coinsModalArray.indexOf(coinName);
    coinsModalArray.splice(pos, 1);
  }
};

//a function that recevis the toggle element of the sixth coin that was pressed and opens that modal:
const openModal = function (coin) {
  renderModal();
  $(".modal").modal("show");
  $(".my-btn-modal").on("change", function () {
    switchCoins(this, coin);
  });
};

//a function that switch the sixth coin with one of the coins in the modal list
//closes the modal and change the toggle buttons accordingly:
const switchCoins = (toggleModalEl, sixthCoinEl) => {
  $(toggleModalEl).prop("checked", false);
  closeModal();
  let index = toggleModalEl.id.slice(4);
  let nameOfCoin = coinsModalArray[index];

  let coinIndex = getCoinByName(nameOfCoin);
  let toggleBtnElIndex = $(".card").find(`#coin-${coinIndex}-toggle`)[0];
  let sixthCoinName = sixthCoinEl.name;
  coinsModalArray.splice(index, 1, sixthCoinName);
  $(sixthCoinEl).prop("checked", true);
  $(toggleBtnElIndex).prop("checked", false);
};

const getCoinByName = (name) => {
  for (let i = 0; i < displayCoins.length; i++) {
    const element = displayCoins[i];
    if (element.name === name) {
      return i;
    }
  }
};
//a function that renders the selected coins into the modal body:
const renderModal = () => {
  $(".modal-body").html("");
  let data = "";
  coinsModalArray.map((item, index) => {
    data += ` <p class=" d-flex justify-content-start">
  <span class="form-check d-inline form-switch">
  <input class="form-check-input my-btn-modal" id="coin${index}" checked type="checkbox" role="switch" data-toggle="switchbutton"  data-height="75" id="flexSwitchCheckDefault" />
  </span>
  <span class="d-inline" >${item}</span>
 </p>
<hr>`;
  });
  $(".modal-body").html(data);
};

//a function that closes the modal:
const closeModal = () => {
  $(".modal").modal("hide");
};

// about me function
const aboutMe = () => {
  $("#coinsContainer").empty();
  let data = "";
  data += `<div class="container">
  <section class="mx-auto my-5" style="max-width: 23rem;">
      
    <div class="card testimonial-card mt-2 mb-3">
      <div class="card-up aqua-gradient"></div>
      <div class="avatar mx-auto white">
        <img src="assets/Ido.jpg" class="img-fluid">
      </div>
      <div class="card-body text-center text-primary">
        <h4 class="card-title font-weight-bold">Ido Sochalutsky</h4>
        <hr>
        <p><i class="fas fa-quote-left"></i>If you can't change your fate, change your attitude  <i class="fas fa-quote-right"></i></p>
      </div>
    </div>
    
  </section>
</div> `;

  $("#coinsContainer").append(data);
};
