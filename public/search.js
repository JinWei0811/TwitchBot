var recordList = [];

function myFunction() {
  var twitchId = document.getElementById("twitchId").value;

  fetch(
    `https://caterwauling-aboard-tick.glitch.me/search?twitchId=${twitchId}`
  )
    .then((response) => response.json())
    .then((result) => {
      document.getElementById("demo").innerHTML = "查詢結果：" + result.result;

      let date = new Date().toLocaleString("TW", { timeZone: "Asia/Taipei" });
      let record = {
        searchTime: date,
        twitchId: twitchId,
        result: result.result,
      };
      recordList.push(record);
      document.querySelector("#myTable tbody").innerHTML = recordList
        .map(
          (result) =>
            `<tr><td>${result.searchTime}</td><td>${result.twitchId}</td><td>${result.result}</td>`
        )
        .join("");
    });
}

function research() {
  let newRecordList = [];
  for (let i = 0; i < recordList.length; i++) {
    fetch(
      `https://caterwauling-aboard-tick.glitch.me/search?twitchId=${recordList[i].twitchId}`
    )
      .then((response) => response.json())
      .then((result) => {
        let date = new Date().toLocaleString("TW", { timeZone: "Asia/Taipei" });
        let record = {
          searchTime: date,
          twitchId: recordList[i].twitchId,
          result: result.result,
        };
        newRecordList.push(record);
        if (i == recordList.length - 1) {
          recordList = newRecordList;
          document.querySelector("#myTable tbody").innerHTML = recordList
            .map(
              (result) =>
                `<tr><td>${result.searchTime}</td><td>${result.twitchId}</td><td>${result.result}</td>`
            )
            .join("");
        }
      });
  }
}

function clear() {
  console.log('clear');
  recordList = [];
  document.querySelector("#myTable tbody").innerHTML =  `<tr></tr>`
  // recordList
  //   .map(
  //     (result) =>
  //       `<tr><td>${result.searchTime}</td><td>${result.twitchId}</td><td>${result.result}</td>`
  //   )
  //   .join("");
}
