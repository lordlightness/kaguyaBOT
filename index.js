const { Client, LocalAuth } = require("whatsapp-web.js")
const qrterm = require("qrcode-terminal")
const fs = require("fs")
const cron = require("node-cron")
const msgHndlr = require("./msgHndlr")
const { chromium } = require("playwright-chromium")
const { platform } = require("os")
const client = new Client({
    authStrategy: new LocalAuth(),
    qrMaxRetries: 3,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 3000,
    bypassCSP: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-web-security',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-setuid-sandbox',
            '--disable-accelerated-2d-canvas',
            '--disable-session-crashed-bubble',
            '--start-maximized',
            '--disable-features=LightMode',
            '--force-dark-mode'
        ],
        ignoreHTTPSErrors: true,
        executablePath: platform() === 'win32' ? chromium.executablePath() : platform() === "linux" ? '/usr/bin/google-chrome-stable' : '',
        //'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
})
client.initialize()

client.on("loading_screen", (percent, msg) => {
    console.log("LOADING SCREEN", percent, msg)
})

client.on("qr", (qrdata) => {
    qrterm.generate(qrdata, { small: true }, (qrbuffer) => {
        console.log(qrbuffer)
    })
})

client.on("authenticated", () => {
    console.log("AUTHENTICATION")
})

client.on("auth_failure", () => {
    console.log("AUTHENTICATION FAILED")
})

client.on("ready", () => {
    console.log("WHATSAPP WEB IS READY!")
})

client.on("message_create", (message) => {
    if (!message._data.isNewMsg) return
    if (message.id.fromMe) return
    // return
    msgHndlr(client, message)
})

cron.schedule("* * * * *", () => {
    const medias = fs.readdirSync("./temp/")
    medias.forEach(media => {
        fs.unlinkSync(`./temp/${media}`)
    })
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
}).start()
