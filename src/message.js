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
      try {
        this.msg = JSON.parse(data)
      } catch (e) {
        this.msg = {}
      }
    } else {
      this.msg = {}
    }
  }

  /**
   * Get message type
   *
   * @param {String} typeProp - The name of the type property
   */
  getType(typeProp) {
    return this.msg[typeProp]
  }

  /**
   * Set message type.
   *
   * @param {String} typeProp - The name of the type property
   * @param {String} type - The message type
   */
  setType(typeProp, type) {
    this.msg[typeProp] = type
  }

  /**
   * Return json string of message.
   */
  getData() {
    return JSON.stringify(this.msg)
  }

  /**
   * Get message property.
   *
   * @param {String} prop - The message property to retrieve.
   */
  getProp(prop) {
    return this.msg[prop]
  }

  /**
   * Set message property.
   *
   * @param {String} prop - The property to set
   * @param {String} value - The value string
   */
  setProp(prop, value) {
    this.msg[prop] = value
  }
}

/**
 * Expose Message
 */
module.exports = Message
