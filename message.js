/**
 * Denotes all potential message types.
 */
const MessageType = {
  CONNECT: 1,
  CONNECTED: 2,
  NOTIFY_ONLINE: 3,
  CHAT: 4,
  QUEUE: 5,
  RETRY: 6,
  MATCH: 7,
  INVITE: 8,
  NO_MATCH: 9,
  JOIN: 10,
  LOAD_LEVEL: 11,
  LEVEL_LOADED: 12,
  START_GAME: 13,
  PLAYER_INPUT: 14
}

/**
 * Expected keys for incoming and outgoing messages.
 */
const MessageProps = {
  TYPE: 'c',
  PLAYER:'p',
  FRIENDS: 'f',
  RECIPIENT: 'r',
  MESSAGE: 'm',
  RANK: 's',
  RECIPIENTS: 't',
  USERNAME: 'u',
  GAME: 'g'
}

/**
 * Message class used to parse incoming messages and extract message properties.
 */
class Message {
    constructor(data) {
        if (data) {
            this.msg = JSON.parse(data);
        } else {
            this.msg  = {};
        }
    }

    getType() {
        return this.msg[MessageProps.TYPE];
    }

    setType(type) {
        this.msg[MessageProps.TYPE] = type;
    }

    getData() {
        return JSON.strinfigy(this.msg);
    }

    getProperty(prop) {
        return this.msg[prop];
    }

    setProperty(prop, value) {
        this.msg[prop] = value;
    }
}

/**
 * Expose Message class.
 */
exports.Message = Message;

/**
 * Expose message types and message properties.
 */
exports.MessageType = MessageType;
exports.MessageProps = MessageProps;