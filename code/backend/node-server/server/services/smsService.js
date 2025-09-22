export const sendSMS = async (phoneNumber, message) => {
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  return true;
};