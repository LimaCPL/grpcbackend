const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader")
const packageDef = protoLoader.loadSync("chat.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const chatPackage = grpcObject.chatPackage;

const usersInChat = [];
const observers = [];


//Controllers
const join = (call, callback) => {
        console.log(call.request)
        const user = call.request;

        // check username already exists.
        const userExiist = usersInChat.find((_user) => _user.name == user.name);
        if (!userExiist) {
                usersInChat.push(user);
                callback(null, {
                        error: 0,
                        msg: "Success",
                });
        } else {
                callback(null, { error: 1, msg: "user already exist." });
        }

        // console.log('users', usersInChat)
};

const sendMsg = (call, callback) => {
         console.log('users', usersInChat)
        console.log('send', call.request)
        const chatObj = call.request;
        console.log('chatObj', chatObj)
        observers.forEach((observer) => {
                observer.call.write(chatObj);
        });
        callback(null, {});

        // console.log('sendob', observers)
};

const getAllUsers = (call, callback) => {
        callback(null, { users: usersInChat });
};

const receiveMsg = (call, callback) => {
        console.log('receive', call.request)
        observers.push({
                call,
        });

        // console.log('reob', observers)
};

//Server setup
const server = new grpc.Server();
server.bindAsync("0.0.0.0:50000",
        grpc.ServerCredentials.createInsecure(),
        (err, result) => !err ? (server.start(), console.log('Server Running on port 50000')) : console.log(err)
);

server.addService(chatPackage.ChatService.service,
        {
                "join": join,
                "sendMsg": sendMsg,
                "receiveMsg": receiveMsg,
                "getAllUsers": getAllUsers
        });


// server.start();

// console.log('server running')
