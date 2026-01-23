const Hello = (app) => {
    app.get('/hello', (req, res) => {
      res.send('Life is good!')
    })
    app.get('/', (req, res) => {
      res.send('Welcome online chess platform!')
    })
  }
  export default Hello;