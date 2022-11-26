const App = require("../src/Aplication");

class Pagina {


	static async rota(name) {

		console.info(name);

		document.querySelector("app-root").innerHTML = await App.Aplication.LoadPage(`./${name}.html`);
	}

}