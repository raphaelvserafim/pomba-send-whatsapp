const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');


class DB {


	static async start() {
		this.db = await sqlite.open({ filename: './instances.db', driver: sqlite3.Database });
	}

	static async createTables() {

		await this.start();

		await this.db.run(`CREATE TABLE IF NOT EXISTS instances  ( "id"  INTEGER  PRIMARY KEY   , "instance"  VARCHAR)`);

		await this.db.run(`CREATE TABLE IF NOT EXISTS senha ( "id"  INTEGER  PRIMARY KEY   , "senha"  VARCHAR)`);

		await this.db.close();
	}

	static async veficacao_key() {
		await this.start();
		const rows = await this.db.all('SELECT * FROM senha');
		await this.db.close();
		return rows;
	}

	static async salvarSenha(senha) {
		await this.start();
		try {
			await this.db.run(`INSERT INTO senha (senha) VALUES ('${senha}' )`);
			await this.db.close();
			return { status: true }
		} catch (error) {
			return { status: false, message: error }
		}
	}

	static async logar(senha) {
		await this.start();
		const rows = await this.db.all(`SELECT * FROM senha WHERE senha = '${senha}' `);
		await this.db.close();
		return rows;
	}


}


exports.DB = DB;