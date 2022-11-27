const { app, BrowserWindow } = require('electron');
const { DB } = require('./DB');
var fs = require('fs');
const path = require("path");
const { WhatsApp } = require('./Whatsapp');
const { Aplication } = require('./Aplication');

 
global.instances = {};

async function createWindow() {

	const mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		center: true,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		}
	});

	await DB.createTables();

	await Aplication.restore();

	const verificacao = await DB.veficacao_key();

	if (verificacao) {
		if (verificacao.length > 0) {
			mainWindow.loadFile(path.join(__dirname, "../views/index.html"));
		} else {
			mainWindow.loadFile(path.join(__dirname, "../views/criar-senha.html"));
		}
	}




	//mainWindow.maximize();

}


app.whenReady().then(async () => {
	await createWindow();
	app.on("activate", async function () {

		if (BrowserWindow.getAllWindows().length === 0)
			await createWindow();
	});
});


app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});


