import axios from "axios"

class Email {
    constructor() {
        this.baseUrl = "https://desesperadosxd.xyz"
    }

    async code(email) {
        return new Promise(async (resolve, reject) => {
            const { data } = await axios.get(`${this.baseUrl}/code`, {
                params: { email }
            })
            resolve(data)
        })
    }

    async home(email) {
        return new Promise(async (resolve, reject) => {
            const { data } = await axios.get(`${this.baseUrl}/home`, {
                params: { email }
            })
            resolve(data)
        })
    }
}

const a = new Email()

a.code("")