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

let client_NL = [];
let client_GT = [];

// const client0 = new tmi.Client({
//     options: { debug: false },
//     identity: {
//         username: process.env.USERNAME2,
//         password: process.env.PASSWORD2,
//     },
//     channels: ["never_loses"],
// });

// const client1 = new tmi.Client({
//     options: { debug: false },
//     identity: {
//         username: 'f92175bot',
//         password: 'oauth:y3fgik4mkrrivct5z8gxxjao8c0jks',
//     },
//     channels: ["asiagodtonegg3be0"],
// });
// client0.connect();
// client1.connect();
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

app.post("/connect", function (request, rsponse) {
    let username = request.body.username;
    let password = request.body.password;

    let client0 = new tmi.Client({
        options: { debug: false },
        identity: {
            username: username,
            password: password,
        },
        channels: ["never_loses"],
    });

    let client1 = new tmi.Client({
        options: { debug: false },
        identity: {
            username: username,
            password: password,
        },
        channels: ["asiagodtonegg3be0"],
    });

    // client0.connect();
    // client1.connect();

    client_NL.push({
        username: username,
        service: client0,
    });

    client_GT.push({
        username: username,
        service: client1,
    })

    rsponse.send({
        status: 'Connected'
    })
});

app.post("/chat", function (request, response) {
    let username = request.body.username;
    let content = request.body.content;
    let client = client_NL.find(v => v.username === username).service
    if (!_.isNil(client)) {
        client.say(`#never_loses`, `${content}`);
    }
    // client0.say(`#never_loses`, `${twitchId} ： ${content}`);
});

app.post("/chat_asiagodtone", function (request, response) {
    let username = request.body.username;
    let content = request.body.content;
    let client = client_GT.find(v => v.username === username).service;
    if (!_.isNil(client)) {
        client.say(`#asiagodtonegg3be0`, `${content}`);
    }
    // client1.say(`#asiagodtonegg3be0`, `${twitchId} ： ${content}`);
});

app.post('/chat_wake', function (request, response) {
    let content = request.body.connect;
    client0.say(`#never_loses`, '!守靈');
})

setInterval(() => {
    // fetch("https://twitchbot850811.herokuapp.com/wakeup", {
    // fetch("https://twitchbot0726.herokuapp.com//wakeup", {
    fetch("https://twitchbot.onrender.com/wakeup", {
        method: "GET",
    });
}, 180000);