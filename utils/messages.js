const generateMessage = (username, text) => {
    console.log({ created: new Date().getTime()})
    return {
        username,
        text,
        createdAt: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    }
}

const generateLocationMessage = (username, URL) => {
    return {
        username,
        URL,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}