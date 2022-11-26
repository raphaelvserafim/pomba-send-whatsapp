const QRCode = require('qrcode')
const pino = require('pino')
const { default: makeWASocket, DisconnectReason, Browsers, fetchLatestBaileysVersion, useMultiFileAuthState } = require('@adiwajshing/baileys')



class WhatsApp {

	online = false;
	qrCode = '';
	socket = [];

	constructor(key) {
		this.key = key;
	};


	connect() {
		this.setHandlers();
		return this;
	};


	async setHandlers() {


		const { version, isLatest } = await fetchLatestBaileysVersion();
		const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${this.key}/`);
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

		const socket = makeWASocket(socketConfig);

		this.socket = socket;

		socket.ev.on("creds.update", saveCreds);


		socket.ev.on("connection.update", async (update) => {

			const { connection, lastDisconnect, } = update;

			if (connection == "connecting") {
				this.online = false;
				return;
			} else if (connection === "close") {

			} else if (connection === 'open') {

				this.online = true;
				this.qrcodeCount = 0;
				this.qrCode = '';

			}

			if (update.qr) {
				if (this.qrcodeCount >= 5) {
					socket.ev.removeAllListeners("connection.update");
					this.instance.qrCode = '';
					return socket.end(new Boom("QR code limit", { statusCode: DisconnectReason.badSession, }));
				}
				QRCode.toDataURL(update.qr).then((url) => {
					this.qrcodeCount++;
					this.qrCode = url;
					// global.instances[this.key].qrCode = url
				});
			}
		});

	}


}



exports.WhatsApp = WhatsApp;