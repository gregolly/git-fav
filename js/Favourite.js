import { GithubUser } from './GithubUser.js'

export class Favourites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favourites:')) || []
    }

    save() {
        localStorage.setItem('@github-favourites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username)
            if(userExists) {
                throw new Error('Usuario ja cadastraado!')
            }

            const user = await GithubUser.search(username)
            if(user.login === undefined) {
                throw new Error('Usuario nao encontrado!')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()
        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

export class FavouritesView extends Favourites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onAdd()
    }

    onAdd() {
        const searchForm = this.root.querySelector('.search')
        searchForm.onsubmit = (event) => {
            event.preventDefault()
            let { value } = this.root.querySelector('#username-input')

            this.add(value)
        }
    }

    update() {
        this.removeAllTr()

        this.entries.forEach(user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Image de ${user.name}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers
            row.querySelector('.user a').href = `https://github.com/${user.login}`

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?')

                if(isOk) {
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
                <img src="https://github.com/gregolly.png" alt="">
                <a href="https://github.com/gregolly" target="_blank">
                    <p>Gregolly</p>
                    <span>/gregolly</span>
                </a>
            </td>
            <td class="repositories">
                56 
            </td>
            <td class="followers">
                1200
            </td>
            <td>
                <button class="remove">Remover</button>
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