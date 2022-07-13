import("/app/botTone.js");
import("/app/botTransfer.js");
import tmi from "tmi.js";
import _ from "lodash";
import translate from '@vitalets/google-translate-api';
import * as teams from "./SportTeam.js";
import {
  getFollowTime,
  getNewCOVID,
  getStock,
  checkUId,
  checkUserByUID,
  fetchNBA,
  fetchMLB,
  fetchMLBGame,
} from "./API.js";

// Parameters
let canDo = true;
let covidResult = {};
const NBA = teams.NBA;
const MLB = teams.MLB;
let streamerList = [
  {
    name: "統神",
    value: "43177431",
  },
  {
    name: "GodJJ",
    value: "11561802",
  },
  {
    name: "依渟",
    value: "117348035",
  },
  {
    name: '小熊',
    value: '57775220'
  }
];

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: process.env.USERNAME1,
    password: process.env.PASSWORD1,
  },
  channels: ["never_loses"],
});

client.connect();
client.on("message", async (channel, tags, message, self) => {
  // Ignore echoed messages.
  if (self) return;
  let chanName = `${tags["display-name"]}`;
  let username = chanName;

  if (message.indexOf('!ch') || message.indexOf('!en')) {
    var modeList = [{
      index: '!ch',
      value: 'en'
    },
    {
      index: '!en',
      value: 'zh-TW'
    }];
    var mode = modeList.find(v => message.indexOf(v.index) >= 0);
    let talk = message.substring(message.indexOf(mode.index) + 3,);
    translate(talk, { to: mode.value }).then(res => {
      client.say(channel, `${res.text}`)
    }).catch(err => {
      console.error(err);
    });
  }

  if (
    (username == "raccattack850811" && message == "nlnlSoFun") ||
    (message.includes("!有驚無險") && canDo)
  ) {
    let date = new Date(
      new Date().toLocaleString("TW", { timeZone: "Asia/Taipei" })
    );
    canDo = false;
    talkSomething(`@${chanName}, 有驚無險，又到${date.getHours()}點 GivePLZ`);
  }

  if (message === "!確診人數" && canDo) {
    let nowDate = new Date(
      new Date().toLocaleString("TW", { timeZone: "Asia/Taipei" })
    );
    let talkResult = "";
    nowDate.setHours(nowDate.getHours() - 10);
    if (
      _.isEmpty(covidResult) ||
      covidResult.date.getDate() !== nowDate.getDate()
    ) {
      covidResult = await getNewCOVID(nowDate);
    }

    if (_.isEmpty(covidResult)) {
      talkResult = `@${chanName}, 今日人數尚未公布。  資料來源:衛福部疾管署新聞稿 RaccAttack`;
    } else {
      talkResult = `@${chanName}, 感謝時中台北市長候選人 ThankEgg  ${covidResult.date.getMonth() + 1
        }/${covidResult.date.getDate()} ${covidResult.title
        }。 資料來源:衛福部疾管署新聞稿`;
    }
    canDo = false;
    talkSomething(talkResult);
  }

  if (message.includes("!stock") && canDo) {
    let stock_list = message.match(/[0-9]+/);
    let talkResult = "";
    if (_.isNil(stock_list)) {
      talkResult = `@${chanName}, 查無股票代碼`;
      canDo = false;
      talkSomething(talkResult);
    }
    let stock_id = stock_list[0];
    let date = new Date(
      new Date().toLocaleString("TW", { timeZone: "Asia/Taipei" })
    );
    let stock = await getStock(stock_id, ".TW");
    if (_.isEmpty(stock)) {
      stock = await getStock(stock_id, "");
    }
    if (_.isEmpty(stock)) {
      talkResult = `@${chanName}, 查無此檔股票`;
      canDo = false;
      talkSomething(talkResult);
      return;
    }
    switch (stock[0].changeStatus) {
      case "equal":
        talkResult = `@${chanName},${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}  🟡 有驚無險 GivePLZ ${stock[0].symbolName
          } 平盤 ${stock[0].price}元, 白忙一場`;
        break;
      case "down":
        talkResult = `@${chanName},${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}  🟢 逢低加碼 SwiftRage ${stock[0].symbolName
          } ${stock[0].change} 跌到 ${stock[0].price}元 PoroSad`;
        break;
      case "up":
        talkResult = `@${chanName},${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}  🔴 有驚無險 GivePLZ ${stock[0].symbolName
          } ${stock[0].change} 漲到 ${stock[0].price}元 MingLee`;
        break;
    }
    canDo = false;
    talkSomething(talkResult);
  }

  if (message.includes("!追隨")) {
    let to_id = "";
    let to_name = "";
    let from_id = tags["user-id"];
    let talkResult = "";
    for (let item of streamerList) {
      if (message.includes(item.name)) {
        to_id = item.value;
        to_name = item.name;
        break;
      }
    }
    if (to_id === "") {
      if (message !== "!追隨時間") {
        return;
      }
      to_id = "29722828";
    }
    let follow_info = await getFollowTime(from_id, to_id);
    if (follow_info.total === 0) {
      talkResult = `@${chanName} 你沒有追隨${to_name} cmonBruh`;
      canDo = false;
      talkSomething(talkResult);
      return;
    }
    let follow_date = new Date(follow_info.data[0].followed_at);
    talkResult = `@${chanName} 您從${follow_date.getFullYear()}年${follow_date.getMonth() + 1
      }月${follow_date.getDate()}日開始追隨${to_name}`;
    canDo = false;
    talkSomething(talkResult);
  }

  if (message.includes("!稽查")) {
    let user_name = message.match(/[A-Za-z0-9_]+/);
    let talkResult = "";
    if (_.isNil(user_name)) {
      return;
    }
    let user_info = await checkUId(user_name);
    if (user_info.data.length === 0) {
      talkResult = `MrDestructoid @${chanName}, 查無 ${user_name} 此人`;
      canDo = false;
      talkSomething(talkResult);
      return;
    }
    let uid = user_info.data[0].id;
    let follow_info = await checkUserByUID(uid);
    let response = `${user_info.data[0].display_name} 追隨名單`;
    let follow_length =
      follow_info.data.length > 5 ? 5 : follow_info.data.length;
    for (let i = 0; i < follow_length; i++) {
      if (follow_length !== follow_length - 1) {
        response += `【${follow_info.data[i].to_name}】,`;
      } else {
        response += `【${follow_info.data[i].to_name}】`;
      }
    }
    talkResult = `@${chanName} ${response}`;
    canDo = false;
    talkSomething(talkResult);
  }

  if (containNBATeam(message)) {
    let team_code = NBA.find((v) =>
      v.teamCH.includes(message.split("!")[1])
    ).teamEN;
    let NBA_info = await fetchNBA();
    let games = NBA_info.scoreboard.games;
    let talkResult = "";
    for (let item of games) {
      if (item.gameCode.includes(team_code)) {
        let homeTeam = NBA.find(
          (v) => v.teamEN == item.homeTeam.teamTricode
        ).teamCH;
        let awayTeam = NBA.find(
          (v) => v.teamEN == item.awayTeam.teamTricode
        ).teamCH;
        let homeScore = item.homeTeam.score;
        let awayScore = item.awayTeam.score;
        let gameStatus = "";
        let nonsense = "";

        if (item.gameStatus == 1) {
          gameStatus = `尚未開始， ${item.gameStatusText} 開打`;
        } else {
          if (item.gameStatusText.trim() == "Half") {
            gameStatus = "中場休息";
          } else if (item.gameStatusText.trim() == "Final") {
            gameStatus = "終場";
          } else {
            let statusReg = /Q[1-4]?/;
            let statusText = item.gameStatusText;
            let statusCH =
              "第" + statusText.match(statusReg)[0].replace("Q", "") + "節";
            gameStatus = statusText.replace(statusReg, statusCH);
          }
          talkResult = `@${chanName}, ${gameStatus}  ${homeTeam} ${homeScore} ： ${awayTeam} ${awayScore} `;
          canDo = false;
          talkSomething(talkResult);
        }
      }
    }
  }

  if (containMLBTeam(message)) {
    let teamId = MLB.find((v) =>
      v.teamCH.includes(message.split("!")[1])
    ).teamId;
    let MLB_info = await fetchMLB();
    let games = MLB_info.dates[0].games;
    let talkResult = "";
    for (let item of games) {
      if (
        item.teams.home.team.id === teamId ||
        item.teams.away.team.id === teamId
      ) {
        let homeTeam = MLB.find(
          (v) => v.teamId === item.teams.home.team.id
        ).teamCH;
        let awayTeam = MLB.find(
          (v) => v.teamId === item.teams.away.team.id
        ).teamCH;
        let homeScore = "";
        let awayScore = "";
        let currentInning = "";
        let state = "";
        let status = "";
        if (
          item.status.codedGameState === "F" ||
          item.status.codedGameState === "O"
        ) {
          status = "比賽結束";
          homeScore = item.teams.home.score;
          awayScore = item.teams.away.score;
        } else if (item.status.codedGameState === "I") {
          status = "比賽進行中";
          let game_info = await fetchMLBGame(item.link);
          currentInning = game_info.liveData.linescore.currentInning;
          homeScore = item.teams.home.score;
          awayScore = item.teams.away.score;
          switch (game_info.liveData.linescore.inningState) {
            case "Bottom":
              state = "局下半";
              break;
            case "Top":
              state = "局上半";
              break;
            default:
              state = "局中";
          }
        } else if (item.status.codedGameState === "C") {
          status = "比賽取消";
        } else if (item.status.codeGameState === "D") {
          status = "比賽Delay";
        } else if (item.status.codeGameState === "P") {
          status = "比賽即將開始";
        } else if (item.status.codedGameState === "S") {
          let startDate = new Date(
            new Date(item.gameDate).toLocaleString("TW", {
              timeZone: "Asia/Taipei",
            })
          );
          let hour =
            startDate.getHours() > 9
              ? startDate.getHours()
              : `0${startDate.getHours()}`;
          let minutes =
            startDate.getMinutes() > 9
              ? startDate.getMinutes()
              : `0${startDate.getMinutes()}`;
          status = `比賽預計 ${hour}:${minutes} 開始`;
        }

        let nowDate = new Date(
          new Date().toLocaleString("TW", { timeZone: "Asia/Taipei" })
        );
        let nowHour =
          nowDate.getHours() > 9
            ? nowDate.getHours()
            : `0${nowDate.getHours()}`;
        let nowMinutes =
          nowDate.getMinutes() > 9
            ? nowDate.getMinutes()
            : `0${nowDate.getMinutes()}`;
        let nowSeconds =
          nowDate.getSeconds() > 9
            ? nowDate.getSeconds()
            : `0${nowDate.getSeconds()}`;
        talkResult = `@${chanName}, ${nowHour}:${nowMinutes}:${nowSeconds} ${status}${currentInning} ${state} ${homeTeam} ${homeScore} : ${awayTeam} ${awayScore}`;
        canDo = false;
        talkSomething(talkResult);
      }
    }
  }

  function talkSomething(result) {
    client.say(channel, result);
    setTimeout(function () {
      canDo = true;
    }, 1200);
  }

  function containNBATeam(message) {
    return (
      message.includes("!塞爾提克") ||
      message.includes("!籃網") ||
      message.includes("!尼克") ||
      message.includes("!76人") ||
      message.includes("!暴龍") ||
      message.includes("!公牛") ||
      message.includes("!騎士") ||
      message.includes("!活塞") ||
      message.includes("!溜馬") ||
      message.includes("!公鹿") ||
      message.includes("!老鷹") ||
      message.includes("!鵜鶘") ||
      message.includes("!熱火") ||
      message.includes("!魔術") ||
      message.includes("!巫師") ||
      message.includes("!獨行俠") ||
      message.includes("!灰熊") ||
      message.includes("!火箭") ||
      message.includes("!黃蜂") ||
      message.includes("!馬刺") ||
      message.includes("!金塊") ||
      message.includes("!灰狼") ||
      message.includes("!拓荒者") ||
      message.includes("!活塞") ||
      message.includes("!爵士") ||
      message.includes("!勇士") ||
      message.includes("!快艇") ||
      message.includes("!湖人") ||
      message.includes("!太陽") ||
      message.includes("!國王")
    );
  }

  function containMLBTeam(message) {
    return (
      message == "!金鶯" ||
      message == "!紅襪" ||
      message == "!洋基" ||
      message == "!光芒" ||
      message == "!藍鳥" ||
      message == "!老虎" ||
      message == "!皇家" ||
      message == "!守護者" ||
      message == "!雙城" ||
      message == "!白襪" ||
      message == "!天使" ||
      message == "!太空人" ||
      message == "!運動家" ||
      message == "!水手" ||
      message == "!遊騎兵" ||
      message == "!大都會" ||
      message == "!國民" ||
      message == "!費城人" ||
      message == "!海盜" ||
      message == "!紅雀" ||
      message == "!釀酒人" ||
      message == "!響尾蛇" ||
      message == "!落磯" ||
      message == "!道奇" ||
      message == "!教士" ||
      message == "!巨人" ||
      message == "!小熊" ||
      message == "!紅人" ||
      message == "!馬林魚"
      //|| message == "!MLB勇士"
    );
  }
});
