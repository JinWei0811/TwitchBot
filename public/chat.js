function myFunction() {
  var twitchId = document.getElementById("twitchId0").value;
  var content = document.getElementById("content0").value;
  var myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");

  var body = {
    twitchId: twitchId,
    content: content,
  };

  if (twitchId == "" || content == "") {
    return;
  }

  var grab = document.getElementById("content0");
  if (grab.value != "") {
    grab.value = "";
  }

  fetch(`https://twitchbot.onrender.com/chat`, {
    method: "POST",
    headers: myHeaders,
    mode: "cors",
    cache: "default",
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((result) => { return; });
}


function myGodtoneFunction() {
  var twitchId = document.getElementById("twitchId1").value;
  var content = document.getElementById("content1").value;
  var myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");

  var body = {
    twitchId: twitchId,
    content: content,
  };

  if (twitchId == "" || content == "") {
    return;
  }

  var grab = document.getElementById("content1");
  if (grab.value != "") {
    grab.value = "";
  }
  
  fetch(`https://twitchbot.onrender.com/chat_asiagodtone`, {
    method: "POST",
    headers: myHeaders,
    mode: "cors",
    cache: "default",
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((result) => { return; });
}