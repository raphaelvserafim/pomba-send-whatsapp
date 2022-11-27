const QRCode = require('qrcode')
const pino = require('pino')
const { default: makeWASocket, DisconnectReason, Browsers, fetchLatestBaileysVersion, useMultiFileAuthState } = require('@adiwajshing/baileys')
const fs = require('fs');
const instancesJSON = require("../instances.json");


class WhatsApp {

	online = false;
	qrCode = '';
	socket = [];

	constructor(key) {
		this.key = key;
	};


	async connect() {

		const { version, isLatest } = await fetchLatestBaileysVersion();
		const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${this.key}/`);

		this.saveCreds = saveCreds;

		const socketConfig = {
			version,
			auth: state,
			syncFullHistory: false,
			browser: Browsers.macOS('Desktop'),
			logger: pino({ level: "silent" }),
			generateHighQualityLinkPreview: true,
			patchMessageBeforeSending: (message) => {
				const requiresPatch = !!(
					message.buttonsMessage ||
					// || message.templateMessage
					message.listMessage
				);
				if (requiresPatch) {
					message = {
						viewOnceMessage: {
							message: {
								messageContextInfo: {
									deviceListMetadataVersion: 2,
									deviceListMetadata: {},
								},
								...message,
							},
						},
					};
				}
				return message;
			},
		};

		this.socket = makeWASocket(socketConfig);

		await this.setHandlers();

		return this;

	};

	async setHandlers() {


		this.socket.ev.on("creds.update", this.saveCreds);


		this.socket.ev.on("connection.update", async (update) => {

			const { connection, lastDisconnect, } = update;

			if (connection == "connecting") {
				this.online = false;
				return;
			} else if (connection === "close") {
				this.online = false;
				 

			} else if (connection === 'open') {
				this.online = true;
				this.qrcodeCount = 0;
				this.qrCode = '';
				 
			}

			if (update.qr) {
				if (this.qrcodeCount >= 5) {
					this.socket.ev.removeAllListeners("connection.update");
					this.qrCode = '';
					return this.socket.end(new Boom("QR code limit", { statusCode: DisconnectReason.badSession, }));
				}
				QRCode.toDataURL(update.qr).then((url) => {
					this.qrcodeCount++;
					this.qrCode = url;
					 
				});
			}
		});

	}


}



exports.WhatsApp = WhatsApp;