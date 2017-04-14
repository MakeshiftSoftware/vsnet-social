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
    /**
     * If message string is provided, initialize message with parsed json.
     * Otherwise, initialize message with empty object.
     *
     * @param {String} data - The message string
     */
    constructor(data) {
        if (data) {
            this.msg = JSON.parse(data);
        } else {
            this.msg  = {};
        }
    }

    /**
     * Return message type.
     */
    getType() {
        return this.msg[MessageProps.TYPE];
    }

    /**
     * Set message type.
     *
     * @param {String} type - The message type
     */
    setType(type) {
        this.msg[MessageProps.TYPE] = type;
    }

    /**
     * Return json string of message.
     */
    getData() {
        return JSON.strinfigy(this.msg);
    }

    /**
     * Get message property.
     *
     * @param {String} prop - The message property to retrieve.
     */
    getProperty(prop) {
        return this.msg[prop];
    }

    /**
     * Set message property.
     *
     * @param {String} prop - The property to set
     * @param {String} value  - The value string
     */
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