import tmi from 'tmi.js';
import _ from 'lodash';
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 3001;
let headers = {
    Authorization: process.env.Authorization,
    "Client-Id": process.env.ClientId,
};

let options0 = {
    options: {
        debug: false,
    },
    identity: {
        username: process.env.USERNAME2,
        password: process.env.PASSWORD2,
    },
    channels: ["never_loses"],
};

let options1 = {
    options: {
        debug: false,
    },
    identity: {
        username: process.env.USERNAME2,
        password: process.env.PASSWORD2,
    },
    channels: ["asiagodtonegg3be0"],
}

let client0 = new tmi.client(options0);
let client1 = new tmi.client(options1);
client0.connect();
client1.connect();
const listener = app.listen(port, function () { console.log(`Example app listening on port ${port}!`) });

app.get("/search", function (request, response) {
    let twitchId = request.query.twitchId;
    fetch(`https://api.twitch.tv/helix/users?login=${twitchId}`, {
        method: "GET",
        headers: headers,
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.data?.length == 0) {
                let resp = { result: "查無此人" };
                response.send(resp);
            } else {
                let resp = { result: "他還活著" };
                response.send(resp);
            }
        });
});

// app.use(express.static(__dirname + '/public'));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: false,
})
);

app.get("/search.html", function (request, response) {
    response.sendFile("views/search.html", { root: "." });
});

app.get("/chat.html", function (request, response) {
    response.sendFile("views/chat.html", { root: "." });
});

app.get("/wakeup", function (request, response) {
    console.log("i'm awake");
    response.send("i'm awake");
});

app.post("/chat", function (request, response) {
    let twitchId = request.body.twitchId;
    let content = request.body.content;
    client0.say(`#never_loses`, `${twitchId} ： ${content}`);
});

app.post("/chat_asiagodtone", function (request, response) {
    let twitchId = request.body.twitchId;
    let content = request.body.content;
    client1.say(`#asiagodtonegg3be0`, `${twitchId} ： ${content}`);
});

setInterval(() => {
    // fetch("https://twitchbot850811.herokuapp.com/wakeup", {
    // fetch("https://twitchbot0726.herokuapp.com//wakeup", {
    fetch("https://twitchbot.onrender.com/wakeup", {
        method: "GET",
    });
}, 180000);