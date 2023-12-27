const users = []

//add user

const addUser = ({ id, userName, roomName}) => {
    //clean the data
    userName = userName.trim()
    roomName = roomName.trim()

    //validate the data
    if (!userName || !roomName) {
        return {
            error: "Username and room are required"
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.roomName == roomName && user.userName === userName
    })

    //validate username
    if (existingUser) {
        return {
            existingUser
        }
    }

    const user = {id,userName,roomName}
    users.push(user)
    return {
        user
    }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.roomName === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}