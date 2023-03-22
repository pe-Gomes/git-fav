import { GithubUser } from "./githubuser.js"

export class Favorites {
  constructor (root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage
      .getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)     
      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }
      
      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)
      
    this.entries = filteredEntries 
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor (root) {
    super(root)

    this.tbody = this.root.querySelector('tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')

    addButton.onclick = () => {
      // Destructure 'input' to get it's value 
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    if (this.entries.length == 0) {
      this.tbody.append(this.createNoFavsRow())
    }

    this.entries.forEach( user => {
      const row = this.createRow()
      
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repos').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
  
      row.querySelector('.remove')
        .onclick = () => {
          const deleted = confirm('Deseja deletar este usuário?')
          
          if (deleted) {
            this.delete(user)
          }
        }
      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')
    
    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/maykbrito.png" alt="Imagem do Usuário">
        <a href="https://github.com/maykbrito" target= "__blank">
          <p>Mayk Brito</p>
          <span>/maybrito</span>
        </a>
      </td>
      <td class="repos">123</td>
      <td class="followers">1234</td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `
    return tr
  }

  createNoFavsRow() {
    const tr = document.createElement('tr')

    tr.classList.add('no-favs')

    tr.innerHTML = `
      <td>
        <img src="/img/Estrela.svg" alt="Uma Estrela decorativa">
        <span>Nenhum favorito ainda</span>
      </td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }
}
