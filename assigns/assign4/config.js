
module.exports = {
    docker_ip : "192.168.99.100",
    mongodb_port : "27017",
    mongodb_site : "mongodb://192.168.99.100:27017",
    // mongodb_site : mongodb_url(),
    mongodb_database : "conFusion",
    cookie_secret_key : secret_key(),
    session_name : "hello_session",
    session_secret_key : secret_key(),
    jwt_secret_key :  secret_key()
};

function secret_key () {
    return "hello_auth_secret";
}

function mongodb_url() { // TBD
    return "mongodb://" + config.docker_ip + ":" +  config.mongodb_port;
}

