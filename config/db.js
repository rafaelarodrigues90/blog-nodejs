// SE em ambiente de produção
if (process.env.NODE_ENV == "production") {
    module.exports = {mongoURI: "mongodb+srv://ltcmdrdata:c906963u@blogapp-prod-7i4wf.mongodb.net/test?retryWrites=true&w=majority"}
} else {
    // SE na máquina local
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}