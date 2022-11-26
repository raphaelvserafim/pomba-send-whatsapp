const { DB } = require("../src/DB");
const App = require("../src/Aplication");
 

class Auth {


	static async startSessao() {
		const sessao = localStorage.getItem("sessao");
		if (!sessao) {
			document.querySelector("app-root").innerHTML = await App.Aplication.LoadPage('./login.html');
		} else {
			document.querySelector("app-root").innerHTML = await App.Aplication.LoadPage('./home.html');
		}

		 
	}


	static async login() {
		var senha = document.getElementById("senha").value;
		if (senha) {
			var logando = await DB.logar(senha);
			if (logando.length > 0) {
				localStorage.setItem("sessao", 1);
				document.querySelector("app-root").innerHTML = await App.Aplication.LoadPage('./home.html');
			} else {
				alert("Senha incorreta")
			}
		} else {
			alert("Informe a senha antes")
		}
	}

	static async criarSenha() {
		var btn = document.getElementById("btn-criar-senha");
		btn.innerText = `criando...`;
		btn.disabled = true;
		const senha_a = document.getElementById("senha_a").value;
		const senha_b = document.getElementById("senha_b").value;
		if (senha_a && senha_b) {
			if (senha_a == senha_b) {
				const r = await DB.salvarSenha(senha_a);
				if (r.status) {
					window.close();
				}
			} else {
				alert("As senhas não coincidem");
			}
		} else {
			alert("Informe as senhas");
		}

		btn.disabled = false;
		btn.innerText = `Criar senha`;
	}
}