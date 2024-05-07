import("./botTransfer.js");
import tmi from "tmi.js";
import _ from "lodash";
import * as teams from "./SportTeam.js";
import * as GameData from "./GameData.js";
import {
  getFollowTime,
  getNewCOVID,
  getStock,
  checkUId,
  checkUserByUID,
  fetchNBA,
  fetchMLB,
  fetchMLBGame,
  getGameInfo,
} from "./API.js";

let canDo = true;
let covidResult = {};
const NBA = teams.NBA;
const MLB = teams.MLB;
const CPBL = teams.CPBL_TEAM;
const weekday = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
];

let streamerList = [
  {
    name: "依渟",
    value: "117348035",
  },
];

let formatter = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23", // 使用 24 小時制
});

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: "raccattack_bott",
    password: "oauth:t08nxhw2ubynnz81gg4zk2j9hafibh",
  },
  channels: ["asiagodtonegg3be0"],
});

client.connect();
client.on("message", (channel, tags, message, self) => {
  // Ignore echoed messages.
  if (self) return;
  let chanName = `${tags["display-name"]}`;
  let username = chanName;

  if (message.includes("!咕嚕") && canDo && false) {
    let date = new Date(
      new Date().toLocaleString("TW", { timeZone: "Asia/Taipei" })
    );
    talkSomething(`今天${weekday[date.getDay()]}，咕嚕貝果乾 RaccAttack`);
  }

  if (message.includes("!喵叫") && canDo && false) {
    let date = new Date(
      new Date().toLocaleString("TW", { timeZone: "Asia/Taipei" })
    );
    talkSomething(`今天${weekday[date.getDay()]}，喵叫貝果乾哭 BibleThump `);
  }

  if (message.includes("!魚貓") && canDo && false) {
    talkSomething(
      `我是快樂的搬磚工人 GivePLZ 🧱 我是快樂的夜班保全 GivePLZ 🚪 我是快樂的工地主任 👷 我是快樂的冷凍小魚 GivePLZ 🐟`
    );
  }

  if (message.includes("!富邦應援曲") && canDo && false) {
    talkSomething(
      `夠臭我才舔 黑let‘s go 富邦的P眼 反正超強GG 無所畏懼 大師兄都say YEAH HungryPaimon`
    );
  }

  if (message.includes("!有驚無險") && canDo) {
    let nowTimes = nowDates();

    talkSomething(`@${chanName} 有驚無險，又到${nowTimes.hour}點 GivePLZ `);
  }

  if (message === "!確診人數" && canDo && false) {
    (async () => {
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
        talkResult = `@${chanName}, 感謝時中台北市長候選人 ThankEgg  ${
          covidResult.date.getMonth() + 1
        }/${covidResult.date.getDate()} ${
          covidResult.title
        }。 資料來源:衛福部疾管署新聞稿`;
      }
      talkSomething(talkResult);
    })();
  }

  if (message.includes("!stock") && canDo) {
    (async () => {
      let stock_list = message.match(/[0-9]+/);
      let talkResult = "";
      if (_.isNil(stock_list)) {
        talkResult = `@${chanName}, 查無股票代碼`;
        talkSomething(talkResult);
      }
      let stock_id = stock_list[0];
      let nowTimes = nowDates();
      let stock = await getStock(stock_id, ".TW");
      if (_.isEmpty(stock)) {
        stock = await getStock(stock_id, "");
      }
      if (_.isEmpty(stock)) {
        talkResult = `@${chanName}, 查無此檔股票`;
        talkSomething(talkResult);
        return;
      }
      switch (stock[0].changeStatus) {
        case "equal":
          talkResult = `@${chanName}, ${nowTimes.hour}:${nowTimes.min}:${nowTimes.sec}  🟡 有驚無險 GivePLZ ${stock[0].symbolName} 平盤 ${stock[0].price.raw}元, 白忙一場`;
          break;
        case "down":
          talkResult = `@${chanName}, ${nowTimes.hour}:${nowTimes.min}:${nowTimes.sec}  🟢 逢低加碼 SwiftRage ${stock[0].symbolName} ${stock[0].change.raw} 跌到 ${stock[0].price.raw}元 PoroSad`;
          break;
        case "up":
          talkResult = `@${chanName}, ${nowTimes.hour}:${nowTimes.min}:${nowTimes.sec}  🔴 有驚無險 GivePLZ ${stock[0].symbolName} +${stock[0].change.raw} 漲到 ${stock[0].price.raw}元 MingLee`;
          break;
      }
      talkSomething(talkResult);
    })();
  }

  if (message.includes("!追隨") && false) {
    (async () => {
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
        to_id = "43177431";
      }
      let follow_info = await getFollowTime(from_id, to_id);
      if (follow_info.total === 0) {
        talkResult = `@${chanName} 你沒有追隨${to_name} cmonBruh`;
        talkSomething(talkResult);
        return;
      }
      let follow_date = new Date(follow_info.data[0].followed_at);
      talkResult = `@${chanName} 您從${follow_date.getFullYear()}年${
        follow_date.getMonth() + 1
      }月${follow_date.getDate()}日開始追隨${to_name}`;
      talkSomething(talkResult);
    })();
  }

  if (message.includes("!稽查") && false) {
    (async () => {
      let user_name = message.match(/[A-Za-z0-9_]+/);
      let talkResult = "";
      if (_.isNil(user_name)) {
        return;
      }
      let user_info = await checkUId(user_name);
      if (user_info.data.length === 0) {
        talkResult = `MrDestructoid @${chanName}, 查無 ${user_name} 此人`;
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
      talkSomething(talkResult);
    })();
  }

  if (message.includes("!") && containCPBLTeam(message)) {
    (async () => {
      let date = new Date(
        new Date().toLocaleString("TW", { timeZone: "Asia/Taipei" })
      );
      let month =
        date.getMonth() + 1 > 9
          ? date.getMonth() + 1
          : `0${date.getMonth() + 1}`;
      let days = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
      let dateString = `${date.getFullYear()}-${month}-${days}`;
      let talkResult = "";
      let todayGames = GameData.GameData.filter((v) =>
        v.GameDate.match(dateString)
      );
      let teamName = message.replace("!", "");
      for (let game of todayGames) {
        if (
          game.VisitingTeamName.match(teamName) ||
          game.HomeTeamName.match(teamName)
        ) {
          let form = {
            GameSno: game.GameSno,
            KindCode: game.KindCode,
            Year: game.Year,
            PrevOrNext: "",
            PresentStatus: "",
            SelectKindCode: game.KindCode,
            SelectYear: date.getFullYear(),
            SelectMonth: date.getMonth() + 1,
          };
          let gameLogs = await getGameInfo(form);

          for (let gameLog of gameLogs.GameDetailJson) {
            if (gameLog.GameSno === game.GameSno) {
              if (
                gameLog.GameStatus == "1" ||
                gameLog.GameStatus == "4" ||
                gameLog.GameStatus == "5" ||
                gameLog.GameStatus == "6"
              ) {
                talkResult = `@${chanName}, ${
                  gameLog.GameStatusChi
                } ${DateToString(gameLog.GameDateTimeS)} ${
                  gameLog.HomeTeamName
                } : ${gameLog.VisitingTeamName}`;
              } else {
                let inningInfo = gameLogs.ScoreboardJson[0];
                let UpDown = "";
                if (gameLog.GameStatus != "3") {
                  UpDown =
                    inningInfo.TeamAbbr == gameLog.HomeTeamName
                      ? `${inningInfo.InningSeq}局下半${inningInfo.TeamAbbr}進攻`
                      : `${inningInfo.InningSeq}局上半${inningInfo.TeamAbbr}進攻`;
                }
                talkResult = `@${chanName}, ${gameLog.GameStatusChi} ${UpDown} ${gameLog.HomeTeamName} ${gameLog.HomeTotalScore} : ${gameLog.VisitingTotalScore} ${gameLog.VisitingTeamName}`;
              }
              talkSomething(talkResult);
              return;
            }
          }
          talkResult = `@${chanName}, 今日${message}無比賽`;
          talkSomething(talkResult);
        }
      }
    })();
  }

  if (
    (containNBATeam(message) && message.toLowerCase().includes("nba")) ||
    message.includes("!今日天氣")
  ) {
    (async () => {
      if (message.includes("!今日天氣")) {
        message = "!NBA 勇士";
      }
      let team_code = NBA.find((v) =>
        v.teamCH.includes(message.split("!NBA")[1].trim())
      )?.teamEN;
      let NBA_info;
      try {
        NBA_info = await fetchNBA();
      } catch (e) {
        console.log(`fetchNBA error ${e}`);
      }
      let games = NBA_info.scoreboard.games;
      let talkResult = "";
      let count = 0;
      for (let item of games) {
        if (count) {
          break;
        }
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
          }
        }
      }
      if (count) {
        canDo = false;
        talkSomething(talkResult);
      } else {
        let homeTeam = NBA.find((v) => v.teamEN == team_code).teamCH;
        canDo = false;
        talkSomething(`@${chanName},  ${homeTeam} 今天沒有比賽！`);
      }
    })();
  }

  if (containMLBTeam(message) && message.toLowerCase().includes("!mlb")) {
    (async () => {
      let teamId = MLB.find((v) => {
        return v.teamCH.includes(message.split("!MLB ")[1].trim());
      })?.teamId;
      let MLB_info;
      try {
        MLB_info = await fetchMLB();
      } catch (e) {
        console.log(`fetchMLB error ${e}`);
      }
      let games = MLB_info.dates[0].games;
      let talkResult = "";
      let count = 0;
      for (let item of games) {
        if (count) {
          break;
        }
        if (
          item.teams.home.team.id === teamId ||
          item.teams.away.team.id === teamId
        ) {
          count++;
          let homeTeam = MLB.find(
            (v) => v.teamId === item.teams.home.team.id
          ).teamCH;
          let awayTeam = MLB.find(
            (v) => v.teamId === item.teams.away.team.id
          ).teamCH;
          let gameDate = item;
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
            let game_info;
            try {
              game_info = await fetchMLBGame(item.link);
            } catch (e) {
              console.log(`fetchMLBGame error ${e}`);
            }
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

          let nowTimes = nowDates();
          talkResult = `@${chanName}, ${nowTimes.hour}:${nowTimes.min}:${nowTimes.sec} ${status}${currentInning} ${state} ${homeTeam} ${homeScore} : ${awayTeam} ${awayScore}`;
        }
      }
      if (count) {
        canDo = false;
        talkSomething(talkResult);
      } else {
        let homeTeam = MLB.find((v) => v.teamId === teamId).teamCH;
        canDo = false;
        talkSomething(`@${chanName},  ${homeTeam} 今天沒有比賽！`);
      }
    })();
  }

  function nowDates() {
    let parts = formatter.formatToParts(new Date());
    let nowHour = parts.find((p) => p.type === "hour").value;
    let nowMinutes = parts.find((p) => p.type === "minute").value;
    let nowSeconds = parts.find((p) => p.type === "second").value;
    return {
      hour: nowHour,
      min: nowMinutes,
      sec: nowSeconds,
    };
  }

  async function talkSomething(result) {
    try {
      await client.say(channel, result);
      setTimeout(function () {
        canDo = true;
      }, 1200);
    } catch (error) {
      console.error("Full error object:", error);
    }
  }

  function containNBATeam(message) {
    return (
      message.includes("塞爾提克") ||
      message.includes("籃網") ||
      message.includes("尼克") ||
      message.includes("76人") ||
      message.includes("暴龍") ||
      message.includes("公牛") ||
      message.includes("騎士") ||
      message.includes("活塞") ||
      message.includes("溜馬") ||
      message.includes("公鹿") ||
      message.includes("老鷹") ||
      message.includes("鵜鶘") ||
      message.includes("熱火") ||
      message.includes("魔術") ||
      message.includes("巫師") ||
      message.includes("獨行俠") ||
      message.includes("灰熊") ||
      message.includes("火箭") ||
      message.includes("黃蜂") ||
      message.includes("馬刺") ||
      message.includes("金塊") ||
      message.includes("灰狼") ||
      message.includes("拓荒者") ||
      message.includes("活塞") ||
      message.includes("爵士") ||
      message.includes("勇士") ||
      message.includes("快艇") ||
      message.includes("湖人") ||
      message.includes("太陽") ||
      message.includes("國王")
    );
  }

  function containMLBTeam(message) {
    return (
      message.includes("金鶯") ||
      message.includes("紅襪") ||
      message.includes("洋基") ||
      message.includes("光芒") ||
      message.includes("藍鳥") ||
      message.includes("老虎") ||
      message.includes("皇家") ||
      message.includes("守護者") ||
      message.includes("雙城") ||
      message.includes("白襪") ||
      message.includes("天使") ||
      message.includes("太空人") ||
      message.includes("運動家") ||
      message.includes("水手") ||
      message.includes("遊騎兵") ||
      message.includes("大都會") ||
      message.includes("國民") ||
      message.includes("費城人") ||
      message.includes("海盜") ||
      message.includes("紅雀") ||
      message.includes("釀酒人") ||
      message.includes("響尾蛇") ||
      message.includes("落磯") ||
      message.includes("道奇") ||
      message.includes("教士") ||
      message.includes("巨人") ||
      message.includes("小熊") ||
      message.includes("紅人") ||
      message.includes("馬林魚") ||
      message.includes("勇士")
    );
  }

  function containCPBLTeam(message) {
    let teamC = message.replace("!", "");
    for (let team of CPBL) {
      if (team.name.includes(teamC)) {
        return true;
      }
    }
    return false;
  }

  function DateToString(time) {
    let date = new Date(time);
    let hour = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    let minute =
      date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
    let dateString = `${hour}:${minute}`;
    return dateString;
  }
});
