import fetch from 'node-fetch';
import request from 'request';
import cheerio from 'cheerio'
import _ from 'lodash';


let headers = {
    'Authorization': 'Bearer 3k7ovavlj1n2r8l3yf2ntgmrswdl65',
    'Client-Id': 'gp762nuuoqcoxypju8c569th9wz7q5',
};

export { getNewCOVID, getStock, getFollowTime, checkUId, checkUserByUID, fetchNBA, fetchMLB, fetchMLBGame }

function getNewCOVID(nowDate) {
    return new Promise((resolve, reject) => {
        request(
            {
                url: "https://www.cdc.gov.tw/Bulletin/List/MmgtpeidAR5Ooai4-fgHzQ",
                method: "GET",
            },
            function (error, response, body) {
                if (error || !body) {
                    return;
                }

                const $ = cheerio.load(body);
                const list = $(".cbp-l-grid-agency, .cbp-item");
                let newList = [];
                for (let i = 0; i < list.length; i++) {
                    let title = list.eq(i).find(".JQdotdotdot").text().trim();
                    let year = list
                        .eq(i)
                        .find(".icon-year")
                        .text()
                        .trim()
                        .replace(/ /g, "");
                    let date = list.eq(i).find(".icon-date").text().trim();
                    let newsDate = new Date(Date.parse(year + "-" + date));
                    if (
                        newsDate != null &&
                        newsDate.getFullYear() === nowDate.getFullYear() &&
                        newsDate.getMonth() === nowDate.getMonth() &&
                        newsDate.getDate() === nowDate.getDate()
                    ) {
                        let news = {
                            title: title,
                            date: newsDate,
                        };
                        newList.push(news);
                    }
                }

                let reg = /[0-9],[0-9]/g;
                resolve(newList.find((v) => v.title.match(reg)));
            });
    });
}

function getStock(stock_id, area) {
    return new Promise((resolve, reject) => {
        fetch(
            `https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;fields=avgPrice%2Corderbook;symbols=${stock_id}${area}`,
            {
                method: "GET",
            }
        )
            .then((response) => response.json())
            .then((stock) => {
                resolve(stock);
            });
    })
}

function getFollowTime(from_id, to_id) {
    return new Promise((resolve, reject) => {
        fetch(
            `https://api.twitch.tv/helix/users/follows?from_id=${from_id}&to_id=${to_id}`,
            {
                method: "GET",
                headers: headers,
            }
        )
            .then((response) => response.json())
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                console.log(err);
            });
    })
}

function checkUId(user_name) {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitch.tv/helix/users?login=${user_name}`, {
            method: "GET",
            headers: headers,
        })
            .then((response) => response.json())
            .then((result1) => { resolve(result1); });
    })
}

function checkUserByUID(user_id) {
    return new Promise((resolve, reject) => {
        fetch(
            `https://api.twitch.tv/helix/users/follows?from_id=${user_id}`,
            {
                method: "GET",
                headers: headers,
            }
        )
            .then((response) => response.json())
            .then((result2) => { resolve(result2); })
    });
}

function fetchNBA() {
    return new Promise((resolve, reject) => {
        fetch(
            "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json",
            {
                method: "GET",
            }
        )
            .then((response) => response.json())
            .then((result) => { resolve(result) });
    })
}

function fetchMLB() {
    return new Promise((resolve, reject) => {
        fetch("http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1", {
            method: "GET",
        })
            .then((response) => response.json())
            .then((result) => { resolve(result); });
    })
}

function fetchMLBGame(api) {
    return new Promise((resolve, reject) => {
        fetch(`http://statsapi.mlb.com${item.link}`, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((result) => {
                resolve(result);
            });
    })

}