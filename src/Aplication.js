const fs = require('fs');
const { DB } = require("./DB");
const { WhatsApp } = require("./Whatsapp");


global.instances = {};

class Aplication {

	static instances = {};


	static async LoadPage(page) {
		return await (await fetch(page)).text();
	}

	static async uuidv4() {
		return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		);
	}

	static async sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}


	static async restore() {

		const instancias = await DB.instancias();
		if (instancias.length > 0) {
			const instances = {};
			instancias.map(async (r) => {
				const whatsapp = new WhatsApp(r.instance);
				const conn = await whatsapp.connect();
				instances[r.instance] = conn;

			})
			await this.sleep(2000);
			global.instances = instances;

		}



	}

	static getInfor(key) {
		console.info(global.instances);
	}
}


exports.Aplication = Aplication; 