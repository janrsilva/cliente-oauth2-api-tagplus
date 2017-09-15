/**
 * Usando > https://github.com/mulesoft/js-client-oauth2
 */
var ClientOAuth2 = require('client-oauth2')

var tagplus = new ClientOAuth2({
  clientId: '38aef362f9e44d16b5ee0d11b0742263',
  clientSecret: '84082476d7834ddd900b634c35922af6',
  accessTokenUri: 'https://api.tagplus.com.br/oauth2/token',
  authorizationUri: 'https://apidoc.tagplus.com.br/authorize',
  redirectUri: 'http://6e5c5aee.ngrok.io/tagplus/callback',
  scopes: ['read:pedidos', 'write:produtos']
})

var express = require('express')
var app = express()

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('home')
})

app.get('/tagplus/login', function (req, res) {
  var uri = tagplus.code.getUri()

  res.redirect(uri)
})

app.get('/tagplus/callback', function (req, res) {
  tagplus.code.getToken(req.originalUrl)
    .then(function (user) {
      console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... }

      // Refresh the current users access token.
      user.refresh().then(function (updatedUser) {
        console.log(updatedUser !== user) //=> true
        console.log(updatedUser.accessToken)
      })

      // Sign API requests on behalf of the current user.
      user.sign({
        method: 'get',
        url: 'http://api.tagplus.com.br/pedidos'
      })

      // We should store the token into a database.
      return res.send(user.accessToken)
    })
})

app.listen(8080)