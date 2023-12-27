const generateMessage = (userName, text) => {
    return {
        userName,
        text,
        createdAt: getTime()
    }
}

const generateLocationMessage = (userName, URL) => {
    return {
        userName,
        URL,
        createdAt: getTime()
    }
}

const getTime = () => {
    return new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
}

module.exports = {
    generateMessage,
    generateLocationMessage
}