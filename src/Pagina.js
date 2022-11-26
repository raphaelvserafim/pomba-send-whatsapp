
class Pagina {


	static async rota(name) {

		document.querySelector("root-home").innerHTML = await App.Aplication.LoadPage(`./${name}.html`);

		switch (name) {
			case 'dashboard':
				await this.dashboard();
				break;

			case 'instancias':
				await this.instancias();
				break;

			default:
				break;
		}

	}

	static async dashboard() {

	}

	static async instancias() {


		const instancias = await DB.instancias();
		console.info(instancias);
		if (instancias.length > 0) {
			let tr = '';
			instancias.map(async (r) => {

				let conexao = `<span class="badge badge-success">conectado</span>`;
				tr += `
				   <tr>
						<th>${r.id}</th>
						<td></td>
						<td> </td>
						<td>
						<button  onclick="Pagina.deletarInstancia(${r.id})"  class="btn btn-icon-only btn-primary btn-pill text-danger" type="button">
						<span class="material-icons icone-menu">delete</span>
					</button> </td>
					</tr>
			`;
			});
			document.querySelector("tbody").innerHTML = tr;
		}
	}


	static async criarNovaInstancia(btn) {
		btn.innerHTML = 'criando...';
		await App.Aplication.sleep(1000);
		const key = await App.Aplication.uuidv4();
		const result = await DB.salvarInstancia(key);
		if (result.status) {
			await this.instancias();
		} else {
			alert(result.message)
		}
		btn.innerHTML = `Adicionar <span class="ml-1"><span class="material-icons icone-menu">add</span> </span>`;
	}

	static async deletarInstancia(id) {
		if (confirm("Tem certeza ?")) {
			const result = await DB.deletarInstancia(id);
			if (result.status) {
				await this.instancias();
			} else {
				alert(result.message)
			}
		}
	}


}