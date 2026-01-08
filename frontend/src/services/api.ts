import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3333',
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
