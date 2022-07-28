function myFunction() {
  var twitchId = document.getElementById("twitchId").value;
  var content = document.getElementById("content").value;
  var myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");

  var body = {
    twitchId: twitchId,
    content: content,
  };

  if (twitchId == "" || content == "") {
    return;
  }

  var grab = document.getElementById("content");
  if (grab.value != "") {
    grab.value = "";
  }

  // fetch(`https://twitcbot850811.herokuapp.com/chat`, {
  fetch(`https://twitchbot0726.herokuapp.com/chat`, {
    method: "POST",
    headers: myHeaders,
    mode: "cors",
    cache: "default",
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      return;
    });
}
