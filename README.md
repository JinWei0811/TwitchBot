Twitch Bot

此機器人功能是基於 tmi.js 連線於 twitch 聊天室進行自動回話。功能介紹：

1. 報時功能
2. 確診人數(已失效)
3. 股票現價資訊
4. Twitch 追隨時間
5. 查詢 Twitch 他人追蹤
6. NBA隊伍對戰資訊
7. MLB隊伍對戰資訊
8. CPBL隊伍對戰資訊

<hr>

以下爬蟲、Fetch API的功能，可於 API.js 進行翻閱。

## cheerio 爬蟲
- 確診人數：取得 www.cdc.gov.tw 的新聞頁面，取出日期及確診人數。(已失效)

## fetch 外部API
- 股票資訊：利用 yahoo stock 的相關API輸入股票代碼進行查詢。
- Twitch追隨時間：利用 twitch 的相關API進行查詢。
- 查詢 Twitch 他人追蹤：利用 twitch 的相關API進行查詢。
- NBA隊伍對戰資訊：利用 cdn.nba.com 的相關API進行查詢。
- MLB隊伍對戰資訊：利用 statsapi.mlb.com 的相關API進行查詢。
- CPBL隊伍對戰資訊：利用 www.cbpl.com.tw 的相關API進行查詢。