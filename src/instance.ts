import makeWASocket, {
    useMultiFileAuthState,
    Chat,
    ConnectionState,
    Contact,
    DisconnectReason,
    proto,
    WAMessage,
    Browsers,
    fetchLatestBaileysVersion,
    // @ts-ignore
} from '@adiwajshing/baileys'

// @ts-ignore
import { Boom } from "@hapi/boom";
// @ts-ignore
import * as dotenv from "dotenv";
// @ts-ignore
import axios from "axios";
// @ts-ignore
import * as QRCode from "qrcode";
// @ts-ignore
import PinoLogger from "pino";


export class WhatsApp {
    
    public socket: ReturnType<typeof makeWASocket>;

    public key: string;
    public online: boolean;
    public qrcodeCount: number;
    public qrCode: string;

    constructor(key: string) {
        this.key = key;
    };



    connect(): this {
        this.setHandlers();
        return this;
    };


    async setHandlers(): Promise<void> {
        const { version, isLatest } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${this.key}/`);
        const socketConfig = {
            version,
            auth: state,
            syncFullHistory: false,
            browser: Browsers.macOS('Desktop'),
            logger: PinoLogger({ level: "silent" }),
            generateHighQualityLinkPreview: true,
            patchMessageBeforeSending: (message: { buttonsMessage?: any; listMessage?: any; viewOnceMessage?: { message: any; }; }) => {
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


        socket.ev.on("creds.update", saveCreds);


        socket.ev.on("connection.update", async (update: Partial<ConnectionState>) => {

            const { connection, lastDisconnect, } = update;

            if (connection == "connecting") {
                this.online = false;
                return;
            } else if (connection === "close") {
                this.online = false;
                if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                    this.connect();
                } else {
                    this.qrcodeCount = 0;
                    this.qrCode = '';
                    // await FunctionsUtils.deleteFolderRecursive(`./sessions/${this.instance.key}/`);
                }
            } else if (connection === 'open') {

                this.online = true;
                this.qrcodeCount = 0;
                this.qrCode = '';
                // @ts-ignore
                const string = Buffer.from(JSON.stringify({ connection: this.instance?.online ? socket.user : {} }).toString()).toString('base64');

            }

            if (update.qr) {
                if (this.qrcodeCount >= 5) {
                    socket.ev.removeAllListeners("connection.update");
                    this.qrCode = '';
                    return socket.end(new Boom("QR code limit", { statusCode: DisconnectReason.badSession, }));
                }
                QRCode.toDataURL(update.qr).then((url: string) => {
                    this.qrcodeCount++;
                    this.qrCode = url;
                });
            }
        });


    }



}
