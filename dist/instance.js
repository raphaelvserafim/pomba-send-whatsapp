"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.WhatsApp = void 0;
var baileys_1 = require("@adiwajshing/baileys");
// @ts-ignore
var boom_1 = require("@hapi/boom");
// @ts-ignore
var QRCode = require("qrcode");
// @ts-ignore
var pino_1 = require("pino");
var WhatsApp = /** @class */ (function () {
    function WhatsApp(key) {
        this.key = key;
    }
    ;
    WhatsApp.prototype.connect = function () {
        this.setHandlers();
        return this;
    };
    ;
    WhatsApp.prototype.setHandlers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, version, isLatest, _b, state, saveCreds, socketConfig, socket;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, baileys_1.fetchLatestBaileysVersion)()];
                    case 1:
                        _a = _c.sent(), version = _a.version, isLatest = _a.isLatest;
                        return [4 /*yield*/, (0, baileys_1.useMultiFileAuthState)("./sessions/".concat(this.key, "/"))];
                    case 2:
                        _b = _c.sent(), state = _b.state, saveCreds = _b.saveCreds;
                        socketConfig = {
                            version: version,
                            auth: state,
                            syncFullHistory: false,
                            browser: baileys_1.Browsers.macOS('Desktop'),
                            logger: (0, pino_1["default"])({ level: "silent" }),
                            generateHighQualityLinkPreview: true,
                            patchMessageBeforeSending: function (message) {
                                var requiresPatch = !!(message.buttonsMessage ||
                                    // || message.templateMessage
                                    message.listMessage);
                                if (requiresPatch) {
                                    message = {
                                        viewOnceMessage: {
                                            message: __assign({ messageContextInfo: {
                                                    deviceListMetadataVersion: 2,
                                                    deviceListMetadata: {}
                                                } }, message)
                                        }
                                    };
                                }
                                return message;
                            }
                        };
                        socket = (0, baileys_1["default"])(socketConfig);
                        socket.ev.on("creds.update", saveCreds);
                        socket.ev.on("connection.update", function (update) { return __awaiter(_this, void 0, void 0, function () {
                            var connection, lastDisconnect, string;
                            var _this = this;
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                connection = update.connection, lastDisconnect = update.lastDisconnect;
                                if (connection == "connecting") {
                                    this.online = false;
                                    return [2 /*return*/];
                                }
                                else if (connection === "close") {
                                    this.online = false;
                                    if (((_b = (_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== baileys_1.DisconnectReason.loggedOut) {
                                        this.connect();
                                    }
                                    else {
                                        this.qrcodeCount = 0;
                                        this.qrCode = '';
                                        // await FunctionsUtils.deleteFolderRecursive(`./sessions/${this.instance.key}/`);
                                    }
                                }
                                else if (connection === 'open') {
                                    this.online = true;
                                    this.qrcodeCount = 0;
                                    this.qrCode = '';
                                    string = Buffer.from(JSON.stringify({ connection: ((_c = this.instance) === null || _c === void 0 ? void 0 : _c.online) ? socket.user : {} }).toString()).toString('base64');
                                }
                                if (update.qr) {
                                    if (this.qrcodeCount >= 5) {
                                        socket.ev.removeAllListeners("connection.update");
                                        this.qrCode = '';
                                        return [2 /*return*/, socket.end(new boom_1.Boom("QR code limit", { statusCode: baileys_1.DisconnectReason.badSession }))];
                                    }
                                    QRCode.toDataURL(update.qr).then(function (url) {
                                        _this.qrcodeCount++;
                                        _this.qrCode = url;
                                    });
                                }
                                return [2 /*return*/];
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    return WhatsApp;
}());
exports.WhatsApp = WhatsApp;
//# sourceMappingURL=instance.js.map