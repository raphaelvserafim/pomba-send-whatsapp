const { app, BrowserWindow } = require('electron');
const { DB } = require('./DB');
var fs = require('fs');
const path = require("path");
const { WhatsApp } = require('./Whatsapp');


const instances = {};

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


	const instancias = await DB.instancias();
	if (instancias.length > 0) {
		instancias.map((r) => {
			const whatsapp = new WhatsApp(r.instance);
			instances[r.instance] = whatsapp.connect();
		})
	}



	const verificacao = await DB.veficacao_key();

	if (verificacao) {
		if (verificacao.length > 0) {
			mainWindow.loadFile(path.join(__dirname, "../views/index.html"));
		} else {
			mainWindow.loadFile(path.join(__dirname, "../views/criar-senha.html"));
		}
	}

	console.info(instances);


	fs.writeFile("../instances.json", JSON.stringify(instances), function (err) {
		if (err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	});
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


