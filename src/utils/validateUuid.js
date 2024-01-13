const { v4: uuidv4 } = require('uuid');
const isValidUuid =(uuid) =>{
    const uuidRegex = /^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i;
    return uuidRegex.test(uuid);
}

const generateUUID = () => {
    return uuidv4();
  }
  
module.exports = {
    generateUUID,
    isValidUuid
};