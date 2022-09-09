const electron = require("electron");
const { ipcRenderer } = electron;

ipcRenderer.on("pid:added", fetchID);
ipcRenderer.on("pid:deleted", fetchID);

const fetchServerData = () => {
  allParaStructure = [];
  let thresholdData = JSON.parse(localStorage.getItem("threshold")) || {};
  const storedData = JSON.parse(localStorage.getItem("info")) || [];
  document.getElementById("deviceWrapper").innerHTML = "";
  // console.log(storedData);
  // console.log(storedData.length)

  // var dvTable = document.getElementById("dvTable");
  // dvTable.innerHTML = "";

  storedData.forEach((info) => {
    console.log(info.pid);

    var head = new Array();
    head.push(["Parameter", "Value"]);

    //Create a HTML Table element.
    var table = document.createElement("table");
    table.border = "1";

    //Get the count of columns.
    var columnCount = head[0].length;

    //Add the header row.
    var row = table.insertRow(-1);
    var header = document.createElement("th");
    header.colSpan = 2;
    header.innerHTML = info.alias;
    row.appendChild(header);

    row = table.insertRow(-1);
    let cardContent = "";
    // const serverData = async () => {
    fetch("https://api.enggenv.com/api/fetchdata?id=" + info.pid)
      .then((response) => response.json())
      .then((data) => {
        delete data.lg;
        delete data.lt;
        delete data.bv;
        delete data.ts_client;
        delete data.ts_server;

        // console.log(data);
        let deviceWrapper = document.createElement("div");
        deviceWrapper.setAttribute("class", "deviceWrapper");
        deviceWrapper.setAttribute("id", "deviceWrapper");
        let paraList = [];
        Object.entries(data).forEach((item) => {
          paraList.push(item[0]);
          // console.table({
          //   pid: info.pid,
          //   threshold: +thresholdData[info.pid][item[0]],
          //   curr: +item[1],
          // });
          let status = thresholdData[info.pid]
            ? +thresholdData[info.pid][item[0]] < +item[1]
              ? "invalid"
              : "valid"
            : "";
          cardContent += `<div class="card" data-threshold=${status}>
                      <div class="cardHeader">
                          <p>${item[0].split("_").join(".")}</p>
                      </div>
                      <div class="cardBody">
                          <p>${item[1]}</p>
                      </div>
                  </div>`;
        });

        allParaStructure.push({ id: info.pid, para: [...paraList] });
        document.getElementById(
          "deviceWrapper"
        ).innerHTML += `<label><strong>${info.pid}</strong> (${info.alias})</label><div class="cardWrapper">  ${cardContent}</div>`;

        // for (var i = 0; i < columnCount; i++) {
        //     var headerCell = document.createElement("th");
        //     headerCell.innerHTML = head[0][i];
        //     row.appendChild(headerCell);
        // }

        // var keys = Object.keys(data);

        // keys.forEach((para_val) => {
        //     row = table.insertRow(-1);
        //     var paraName = document.createElement("th");
        //     paraName.innerHTML = para_val.toUpperCase();
        //     row.appendChild(paraName);
        //     var cell = row.insertCell(-1);
        //     cell.innerHTML = data[para_val];
        // });
      })
      .catch((err) => console.error(err));
    // }

    // var dvTable = document.getElementById("dvTable");
    // dvTable.innerHTML += "";
    // dvTable.appendChild(table);
  });
};

const closeWindowHandler = () => {
  document.getElementById("thresholdCard").style.transform =
    "scale(0) translate(0%,500%)";
};

const validateThresholdHandler = () => {
  let id = document.getElementById("deviceIds").value;
  let para = document.getElementById("devicePara").value;
  let threshold = document.getElementById("thresholdValue").value;
  let thresholdData = JSON.parse(localStorage.getItem("threshold")) || {};
  //   thresholdData = [];
  if (thresholdData[id]) {
    thresholdData[id] = { ...thresholdData[id], [para]: threshold };
  } else {
    thresholdData = { ...thresholdData, [id]: { [para]: threshold } };
  }
  localStorage.setItem("threshold", JSON.stringify(thresholdData));
};

const showThresholdCard = () => {
  document.getElementById("thresholdCard").style.display = "flex";
  document.getElementById("thresholdCard").style.transform =
    "scale(1) translate(-50%,-50%)";
  deviceList = JSON.parse(localStorage.getItem("info")).map(
    (device) => device.pid
  );
  console.log(deviceList);
  document.getElementById("deviceIds").innerHTML = "";
  deviceList.forEach((item) => {
    document.getElementById(
      "deviceIds"
    ).innerHTML += `<option value=${item}>${item}</option>`;
  });
  setParaHandler({ value: deviceList[0] });
};

const setParaHandler = (e) => {
  document.getElementById("devicePara").innerHTML = "";
  console.log(e.value);
  console.log(allParaStructure);
  let optionPara = allParaStructure.find(
    (device) => device.id === e.value
  ).para;
  optionPara.forEach((item) => {
    document.getElementById(
      "devicePara"
    ).innerHTML += `<option value=${item}>${item}</option>`;
  });
};

document
  .getElementById("downloadData")
  .addEventListener("click", fetchServerData);
document
  .getElementById("setThreshold")
  .addEventListener("click", showThresholdCard);

function fetchID(e, status) {
  console.log(status);
  localStorage.setItem("status", status);
  const info = document.getElementById("info");
  info.innerHTML = localStorage.getItem("info");
  // const li = document.createElement('li');
  // const itemText = document.createTextNode(item);
  // li.appendChild(itemText);
  // ul.appendChild(li);
}

getInfo = () => {
  document.getElementById("deviceWrapper").innerHTML = "";
  if (window.navigator.onLine && JSON.parse(localStorage.getItem("info"))) {
    fetchServerData();
  } else {
    if (window.navigator.onLine) {
    }
  }

  setTimeout(() => {
    getInfo();
  }, 20000);
};

getInfo();

var allParaStructure = [];
