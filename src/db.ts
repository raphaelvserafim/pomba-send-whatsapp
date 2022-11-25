const sqlite = require('sqlite');
const sqlite3 = require('npm').verbose();

export class DB {

	static db: any;

	static async start() {
		this.db = await sqlite.open({ filename: './instances.db', driver: sqlite3.Database });
	}

	static async createTableInstance() {
		await this.start();
		await this.db.run(`CREATE TABLE IF NOT EXISTS instances  ( "id"  INTEGER  PRIMARY KEY   , "instance"  VARCHAR   , "webhook"  TEXT   , "connection"  VARCHAR  )`);
		await this.db.close();
	}

	static async instances() {
		await this.start();
		const rows = await this.db.all('SELECT * FROM instances');
		await this.db.close();
		return rows;
	}

	static async instance(key: string) {
		await this.start();
		const rows = await this.db.all(`SELECT * FROM instances WHERE instance = '${key}' `);
		await this.db.close();
		return rows;
	}

	static async saveInstance(key: string, connection: string, webhook: string) {
		await this.start();
		await this.db.run(`INSERT INTO instances (instance, webhook, connection) VALUES ('${key}', '${webhook}', '${connection}')`);
		await this.db.close();
	}

	static async updateWebhook(key: string, webhook: string,) {
		await this.start();
		await this.db.run(`UPDATE instances SET webhook = '${webhook}' WHERE  instance = '${key}' `);
		await this.db.close();
	}

	static async updateInstanceConnection(key: string, connection: string) {
		await this.start();
		await this.db.run(`UPDATE instances SET connection = '${connection}' WHERE  instance = '${key}' `);
		await this.db.close();
	}

	static async deleteInstance(key: string) {
		await this.start();
		await this.db.run(`DELETE FROM instances WHERE  instance = '${key}' `);
		await this.db.close();
	}


}