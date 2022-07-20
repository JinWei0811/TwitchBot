import tmi from "tmi.js";
import _ from "lodash";
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


const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: 'yuniko_bot',
        password: 'oauth:dspycm2hwzjk8s4rtgs414n5tukekh',
    },
    channels: ["yuniko0720"],
});


client.connect();
client.on('message', async (channel, tags, message, self) => {
    if (self) return;
    if (!canDo) return;
    let chanName = `${tags['display-name']}`;


    if (message.includes('!追隨時間')) {
        let to_id = '57775220';
        let from_id = tags['user-id'];
        let talkResult = '';

        let follow_info = await getFollowTime(from_id, to_id);
        let follow_date = new Date(follow_info.data[0].followed_at);
        talkResult = `@${chanName} 您從${follow_date.getFullYear()}年${follow_date.getMonth() + 1
            }月${follow_date.getDate()}日開始追隨小熊`;
        canDo = false;
        talkSomething(talkResult);
    }

    if (message === "!確診人數") {
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
            talkResult = `@${chanName}, 感謝時中前部長 ThankEgg  ${covidResult.date.getMonth() + 1
                }/${covidResult.date.getDate()} ${covidResult.title
                }。 資料來源:衛福部疾管署新聞稿`;
        }
        canDo = false;
        talkSomething(talkResult);
    }

    function talkSomething(result) {
        client.say(channel, result);
        setTimeout(function () {
            canDo = true;
        }, 1200);
    }
})

